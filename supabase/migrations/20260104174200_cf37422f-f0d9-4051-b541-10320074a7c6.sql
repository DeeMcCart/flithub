-- Create storage bucket for provider logos
INSERT INTO storage.buckets (id, name, public)
VALUES ('provider-logos', 'provider-logos', true);

-- Allow public read access to provider logos
CREATE POLICY "Provider logos are publicly accessible"
ON storage.objects FOR SELECT
USING (bucket_id = 'provider-logos');

-- Allow admins to upload provider logos
CREATE POLICY "Admins can upload provider logos"
ON storage.objects FOR INSERT
WITH CHECK (
  bucket_id = 'provider-logos' 
  AND public.has_role(auth.uid(), 'admin')
);

-- Allow admins to update provider logos
CREATE POLICY "Admins can update provider logos"
ON storage.objects FOR UPDATE
USING (
  bucket_id = 'provider-logos' 
  AND public.has_role(auth.uid(), 'admin')
);

-- Allow admins to delete provider logos
CREATE POLICY "Admins can delete provider logos"
ON storage.objects FOR DELETE
USING (
  bucket_id = 'provider-logos' 
  AND public.has_role(auth.uid(), 'admin')
);