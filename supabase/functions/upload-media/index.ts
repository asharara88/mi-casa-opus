import { createClient } from "https://esm.sh/@supabase/supabase-js@2.49.1";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type",
};

function jsonResponse(body: Record<string, unknown>, status = 200) {
  return new Response(JSON.stringify(body), {
    status,
    headers: { ...corsHeaders, "Content-Type": "application/json" },
  });
}

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders });
  }

  if (req.method !== "POST") {
    return jsonResponse({ success: false, error: "Method not allowed" }, 405);
  }

  try {
    // Auth – accept service-role key or user JWT
    const authHeader = req.headers.get("Authorization") ?? "";
    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const serviceRoleKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;

    // Use service role for storage operations
    const adminClient = createClient(supabaseUrl, serviceRoleKey);

    // Parse multipart form
    const formData = await req.formData();
    const file = formData.get("file") as File | null;
    const listingId = formData.get("listing_id") as string | null;
    const caption = (formData.get("caption") as string) ?? null;
    const displayOrder = parseInt(
      (formData.get("display_order") as string) ?? "0",
      10
    );

    if (!file || !listingId) {
      return jsonResponse(
        { success: false, error: "file and listing_id are required" },
        400
      );
    }

    // Validate listing exists
    const { data: listing, error: listingErr } = await adminClient
      .from("listings")
      .select("id")
      .eq("id", listingId)
      .maybeSingle();

    if (listingErr || !listing) {
      return jsonResponse(
        { success: false, error: "Listing not found" },
        404
      );
    }

    // Read file bytes & compute SHA-256
    const arrayBuffer = await file.arrayBuffer();
    const hashBuffer = await crypto.subtle.digest("SHA-256", arrayBuffer);
    const fileHash = Array.from(new Uint8Array(hashBuffer))
      .map((b) => b.toString(16).padStart(2, "0"))
      .join("");

    // Determine extension
    const originalName = file.name ?? "upload";
    const ext = originalName.split(".").pop()?.toLowerCase() ?? "jpg";
    const safeName = `${Date.now()}_${crypto.randomUUID().slice(0, 8)}.${ext}`;
    const storagePath = `listings/${listingId}/${safeName}`;

    // Upload to storage
    const { error: uploadErr } = await adminClient.storage
      .from("listing-photos")
      .upload(storagePath, arrayBuffer, {
        contentType: file.type || "image/jpeg",
        upsert: false,
      });

    if (uploadErr) {
      return jsonResponse(
        { success: false, error: `Storage upload failed: ${uploadErr.message}` },
        500
      );
    }

    // Get public URL
    const {
      data: { publicUrl },
    } = adminClient.storage.from("listing-photos").getPublicUrl(storagePath);

    // Check if this is the first photo → make it primary
    const { count } = await adminClient
      .from("listing_media")
      .select("id", { count: "exact", head: true })
      .eq("listing_id", listingId);

    const isPrimary = (count ?? 0) === 0 || displayOrder === 1;

    // If setting this as primary, unset others
    if (isPrimary) {
      await adminClient
        .from("listing_media")
        .update({ is_primary: false })
        .eq("listing_id", listingId)
        .eq("is_primary", true);
    }

    // Insert record
    const { data: mediaRow, error: insertErr } = await adminClient
      .from("listing_media")
      .insert({
        listing_id: listingId,
        storage_path: storagePath,
        public_url: publicUrl,
        caption,
        display_order: displayOrder,
        is_primary: isPrimary,
        file_hash: fileHash,
      })
      .select("id, public_url")
      .single();

    if (insertErr) {
      return jsonResponse(
        { success: false, error: `DB insert failed: ${insertErr.message}` },
        500
      );
    }

    return jsonResponse({
      success: true,
      id: mediaRow.id,
      url: mediaRow.public_url,
    });
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : "Unknown error";
    return jsonResponse({ success: false, error: message }, 500);
  }
});
