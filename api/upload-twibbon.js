// File: api/upload-twibbon.js

import formidable from 'formidable';
import fs from 'fs/promises';

export const config = {
  api: {
    bodyParser: false, // Required for file uploads
  },
};

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const form = formidable({ multiples: false });

  try {
    const [fields, files] = await form.parse(req);

    const file = files.twibbon?.[0];
    if (!file) {
      return res.status(400).json({ error: 'No file uploaded' });
    }

    // Just respond with filename (you can save it later)
    return res.status(200).json({
      message: 'File received!',
      filename: file.originalFilename,
    });
  } catch (err) {
    console.error('Upload error:', err);
    return res.status(500).json({ error: 'Upload failed' });
  }
}
