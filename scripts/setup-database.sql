-- Create memes table
CREATE TABLE IF NOT EXISTS memes (
  id UUID PRIMARY KEY,
  image_url TEXT NOT NULL,
  caption TEXT NOT NULL,
  author TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS memes_created_at_idx ON memes (created_at DESC);
CREATE INDEX IF NOT EXISTS memes_author_idx ON memes (author);

-- Create storage policy for the memes bucket
-- Note: You need to create the bucket manually in the Supabase dashboard
-- and then run this SQL to set the policies

-- Allow anonymous users to view images (read-only)
CREATE POLICY "Allow public read access" ON storage.objects
  FOR SELECT
  USING (bucket_id = 'memes');

-- Allow authenticated users (with service role) to upload images
CREATE POLICY "Allow authenticated users to upload" ON storage.objects
  FOR INSERT
  WITH CHECK (bucket_id = 'memes' AND auth.role() = 'service_role');

-- Allow authenticated users (with service role) to update their own images
CREATE POLICY "Allow authenticated users to update their own images" ON storage.objects
  FOR UPDATE
  USING (bucket_id = 'memes' AND auth.role() = 'service_role');

-- Allow authenticated users (with service role) to delete their own images
CREATE POLICY "Allow authenticated users to delete their own images" ON storage.objects
  FOR DELETE
  USING (bucket_id = 'memes' AND auth.role() = 'service_role');
