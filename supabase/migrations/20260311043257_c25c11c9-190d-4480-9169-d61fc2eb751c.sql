
-- Create storage buckets
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES 
  ('evidence-uploads', 'evidence-uploads', false, 10485760, ARRAY['image/jpeg', 'image/png', 'application/pdf']),
  ('kyc-documents', 'kyc-documents', false, 10485760, ARRAY['image/jpeg', 'image/png', 'application/pdf']),
  ('listing-photos', 'listing-photos', true, 10485760, ARRAY['image/jpeg', 'image/png', 'image/webp'])
ON CONFLICT (id) DO NOTHING;

-- evidence-uploads policies
CREATE POLICY "auth_upload_evidence"
ON storage.objects FOR INSERT TO authenticated
WITH CHECK (bucket_id = 'evidence-uploads');

CREATE POLICY "mgr_view_evidence"
ON storage.objects FOR SELECT TO authenticated
USING (bucket_id = 'evidence-uploads' AND public.has_role(auth.uid(), 'Manager'::public.app_role));

CREATE POLICY "mgr_delete_evidence"
ON storage.objects FOR DELETE TO authenticated
USING (bucket_id = 'evidence-uploads' AND public.has_role(auth.uid(), 'Manager'::public.app_role));

CREATE POLICY "own_view_evidence"
ON storage.objects FOR SELECT TO authenticated
USING (bucket_id = 'evidence-uploads' AND owner_id::uuid = auth.uid());

-- kyc-documents policies
CREATE POLICY "auth_upload_kyc"
ON storage.objects FOR INSERT TO authenticated
WITH CHECK (bucket_id = 'kyc-documents');

CREATE POLICY "mgr_owner_view_kyc"
ON storage.objects FOR SELECT TO authenticated
USING (bucket_id = 'kyc-documents' AND (public.has_role(auth.uid(), 'Manager'::public.app_role) OR public.has_role(auth.uid(), 'Owner'::public.app_role)));

CREATE POLICY "mgr_delete_kyc"
ON storage.objects FOR DELETE TO authenticated
USING (bucket_id = 'kyc-documents' AND public.has_role(auth.uid(), 'Manager'::public.app_role));

CREATE POLICY "own_view_kyc"
ON storage.objects FOR SELECT TO authenticated
USING (bucket_id = 'kyc-documents' AND owner_id::uuid = auth.uid());

-- listing-photos policies
CREATE POLICY "public_view_listing_photos"
ON storage.objects FOR SELECT TO public
USING (bucket_id = 'listing-photos');

CREATE POLICY "auth_upload_listing_photos"
ON storage.objects FOR INSERT TO authenticated
WITH CHECK (bucket_id = 'listing-photos');

CREATE POLICY "mgr_delete_listing_photos"
ON storage.objects FOR DELETE TO authenticated
USING (bucket_id = 'listing-photos' AND public.has_role(auth.uid(), 'Manager'::public.app_role));

CREATE POLICY "own_delete_listing_photos"
ON storage.objects FOR DELETE TO authenticated
USING (bucket_id = 'listing-photos' AND owner_id::uuid = auth.uid());
