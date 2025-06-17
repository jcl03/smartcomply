-- Create storage bucket for checklist documents
INSERT INTO storage.buckets (id, name, public)
VALUES ('checklist-document', 'checklist-document', true)
ON CONFLICT (id) DO NOTHING;

-- Create storage policy to allow authenticated users to upload files
CREATE POLICY "Allow authenticated users to upload checklist documents" ON storage.objects
FOR INSERT WITH CHECK (
  bucket_id = 'checklist-document' 
  AND auth.role() = 'authenticated'
);

-- Create storage policy to allow users to view their own uploaded files
CREATE POLICY "Allow users to view checklist documents" ON storage.objects
FOR SELECT USING (
  bucket_id = 'checklist-document'
);

-- Create storage policy to allow users to delete their own files (optional)
CREATE POLICY "Allow users to delete their own checklist documents" ON storage.objects
FOR DELETE USING (
  bucket_id = 'checklist-document' 
  AND auth.uid()::text = (storage.foldername(name))[1]
);
