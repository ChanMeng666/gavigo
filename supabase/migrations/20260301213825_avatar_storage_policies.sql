-- Allow anyone to upload avatars (anon role, since we use Firebase Auth not Supabase Auth)
CREATE POLICY "Allow public upload to avatars"
ON storage.objects
FOR INSERT
TO anon, authenticated
WITH CHECK (bucket_id = 'avatars');

CREATE POLICY "Allow public update avatars"
ON storage.objects
FOR UPDATE
TO anon, authenticated
USING (bucket_id = 'avatars')
WITH CHECK (bucket_id = 'avatars');

CREATE POLICY "Allow public read avatars"
ON storage.objects
FOR SELECT
TO anon, authenticated
USING (bucket_id = 'avatars');
