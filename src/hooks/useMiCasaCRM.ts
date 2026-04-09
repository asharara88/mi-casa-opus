import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { externalSupabase } from '@/lib/external-supabase';
import { toast } from 'sonner';

// ─── Types ──────────────────────────────────────────────────────────
export interface CRMListing {
  id: string;
  client_id: string | null;
  name: string;
  unit: string | null;
  listing_type: 'rent' | 'sale';
  price: number | null;
  description: string | null;
  location: string | null;
  status: 'available' | 'booked' | 'sold' | 'june2026' | 'off_market';
  bedrooms: number | null;
  area_sqft: number | null;
  notes: string | null;
  created_at?: string;
  thumbnail_url?: string | null;
}

export interface CRMListingMedia {
  id: string;
  listing_id: string;
  url: string;
  storage_path: string | null;
  media_type: 'image' | 'video';
  caption: string | null;
  display_order: number;
}

export interface CRMListingDocument {
  id: string;
  listing_id: string;
  client_id: string | null;
  doc_type: string;
  label: string | null;
  url: string | null;
  storage_path: string | null;
  issued_date: string | null;
  notes: string | null;
}

export interface CRMClient {
  id: string;
  name: string;
  company: string | null;
  phone: string | null;
  email: string | null;
  type: string | null;
  notes: string | null;
}

export interface CRMActivity {
  id: string;
  client_id: string | null;
  listing_id: string | null;
  activity_type: string;
  body: string | null;
  created_at: string;
  listing_name?: string | null;
}

// ─── Price formatting ───────────────────────────────────────────────
export function formatCRMPrice(price: number | null, type: 'rent' | 'sale'): string {
  if (!price || !Number.isFinite(price)) return '—';
  if (type === 'sale') {
    if (price >= 1_000_000) return `AED ${(price / 1_000_000).toFixed(1)}M`;
    return `AED ${Math.round(price / 1_000)}K`;
  }
  // rent
  if (price >= 1_000_000) return `AED ${(price / 1_000_000).toFixed(1)}M/yr`;
  return `AED ${Math.round(price / 1_000)}K/yr`;
}

// ─── Listings hooks ─────────────────────────────────────────────────
export function useExternalListings(type: 'rent' | 'sale') {
  return useQuery({
    queryKey: ['ext-listings', type],
    queryFn: async () => {
      // Fetch listings
      const { data: listings, error } = await externalSupabase
        .from('listings')
        .select('*')
        .eq('listing_type', type)
        .order('created_at', { ascending: false });

      if (error) throw error;

      // Fetch thumbnails (display_order = 0) for all listings
      const ids = (listings || []).map(l => l.id);
      let mediaMap: Record<string, string> = {};
      if (ids.length > 0) {
        const { data: media } = await externalSupabase
          .from('listing_media')
          .select('listing_id, url')
          .in('listing_id', ids)
          .eq('display_order', 0);
        if (media) {
          mediaMap = Object.fromEntries(media.map(m => [m.listing_id, m.url]));
        }
      }

      return (listings || []).map(l => ({
        ...l,
        thumbnail_url: mediaMap[l.id] || null,
      })) as CRMListing[];
    },
  });
}

export function useExternalListing(id: string | null) {
  return useQuery({
    queryKey: ['ext-listing', id],
    enabled: !!id,
    queryFn: async () => {
      const [listingRes, mediaRes, docsRes] = await Promise.all([
        externalSupabase.from('listings').select('*').eq('id', id!).single(),
        externalSupabase.from('listing_media').select('*').eq('listing_id', id!).order('display_order'),
        externalSupabase.from('listing_documents').select('*').eq('listing_id', id!),
      ]);
      if (listingRes.error) throw listingRes.error;
      return {
        listing: listingRes.data as CRMListing,
        media: (mediaRes.data || []) as CRMListingMedia[],
        documents: (docsRes.data || []) as CRMListingDocument[],
      };
    },
  });
}

export function useUpdateListingStatus() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async ({ id, status }: { id: string; status: string }) => {
      const { error } = await externalSupabase
        .from('listings')
        .update({ status })
        .eq('id', id);
      if (error) throw error;
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['ext-listing'] });
      qc.invalidateQueries({ queryKey: ['ext-listings'] });
      toast.success('Status updated');
    },
    onError: (e: Error) => toast.error(e.message),
  });
}

export function useUploadListingMedia() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async ({ listingId, file }: { listingId: string; file: File }) => {
      const ext = file.name.split('.').pop() || 'jpg';
      const path = `${listingId}/${Date.now()}.${ext}`;

      const { error: uploadErr } = await externalSupabase.storage
        .from('listing-media')
        .upload(path, file, { contentType: file.type });
      if (uploadErr) throw uploadErr;

      const { data: urlData } = externalSupabase.storage
        .from('listing-media')
        .getPublicUrl(path);

      // Get current max display_order
      const { data: existing } = await externalSupabase
        .from('listing_media')
        .select('display_order')
        .eq('listing_id', listingId)
        .order('display_order', { ascending: false })
        .limit(1);

      const nextOrder = existing && existing.length > 0 ? existing[0].display_order + 1 : 0;

      const { error: insertErr } = await externalSupabase
        .from('listing_media')
        .insert({
          listing_id: listingId,
          url: urlData.publicUrl,
          storage_path: path,
          media_type: 'image',
          caption: file.name,
          display_order: nextOrder,
        });
      if (insertErr) throw insertErr;
      return urlData.publicUrl;
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['ext-listing'] });
      toast.success('Photo uploaded');
    },
    onError: (e: Error) => toast.error(e.message),
  });
}

// ─── Client hooks ───────────────────────────────────────────────────
export function useExternalClients() {
  return useQuery({
    queryKey: ['ext-clients'],
    queryFn: async () => {
      const { data, error } = await externalSupabase.from('clients').select('*');
      if (error) throw error;
      return (data || []) as CRMClient[];
    },
  });
}

export function useExternalClientPortfolio(clientId: string | null) {
  return useQuery({
    queryKey: ['ext-client-portfolio', clientId],
    enabled: !!clientId,
    queryFn: async () => {
      const { data, error } = await externalSupabase
        .from('listings')
        .select('*')
        .eq('client_id', clientId!);
      if (error) throw error;
      const listings = (data || []) as CRMListing[];
      const available = listings.filter(l => l.status === 'available').length;
      const rentListings = listings.filter(l => l.listing_type === 'rent');
      const saleListings = listings.filter(l => l.listing_type === 'sale');
      const totalRentalValue = rentListings.reduce((s, l) => s + (l.price || 0), 0);
      const totalSaleValue = saleListings.reduce((s, l) => s + (l.price || 0), 0);
      return {
        total: listings.length,
        available,
        totalRentalValue,
        totalSaleValue,
        listings,
      };
    },
  });
}

// ─── Activity log hooks ─────────────────────────────────────────────
export function useActivityLog() {
  return useQuery({
    queryKey: ['ext-activity'],
    queryFn: async () => {
      // Fetch activities
      const { data: activities, error } = await externalSupabase
        .from('activity_log')
        .select('*')
        .order('created_at', { ascending: false });
      if (error) throw error;

      // Fetch listing names for activities that have listing_id
      const listingIds = [...new Set((activities || []).filter(a => a.listing_id).map(a => a.listing_id))];
      let listingNameMap: Record<string, string> = {};
      if (listingIds.length > 0) {
        const { data: listings } = await externalSupabase
          .from('listings')
          .select('id, name')
          .in('id', listingIds);
        if (listings) {
          listingNameMap = Object.fromEntries(listings.map(l => [l.id, l.name]));
        }
      }

      return (activities || []).map(a => ({
        ...a,
        listing_name: a.listing_id ? listingNameMap[a.listing_id] || null : null,
      })) as CRMActivity[];
    },
  });
}

export function useCreateActivity() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (entry: {
      client_id?: string;
      listing_id?: string | null;
      activity_type: string;
      body: string;
    }) => {
      const { error } = await externalSupabase.from('activity_log').insert(entry);
      if (error) throw error;
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['ext-activity'] });
      toast.success('Activity logged');
    },
    onError: (e: Error) => toast.error(e.message),
  });
}
