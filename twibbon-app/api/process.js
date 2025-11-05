export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  // Just a stub for now
  return res.status(200).json({
    processedImages: [
      { name: 'example.png', path: '/sample-output.png' },
    ],
  });
}
