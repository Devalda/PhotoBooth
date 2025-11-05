export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    // Vercel API routes run in serverless env, so we handle basic upload only
    // You can't write to disk permanently, only to /tmp
    const data = await req.formData();
    const file = data.get('twibbon');

    if (!file) {
      return res.status(400).json({ error: 'No file uploaded' });
    }

    // For demonstration: just return success
    return res.status(200).json({ message: 'Twibbon uploaded successfully!' });
  } catch (error) {
    console.error('Upload error:', error);
    return res.status(500).json({ error: 'Upload failed.' });
  }
}
