// api/upload-twibbon.js
import { put } from '@vercel/blob';

export const config = {
  runtime: 'edge', // Enables FormData and fast Edge runtime
};

export default async function handler(req) {
  if (req.method !== 'POST') {
    return new Response(JSON.stringify({ error: 'Method not allowed' }), {
      status: 405,
      headers: { 'Content-Type': 'application/json' },
    });
  }

  try {
    const formData = await req.formData();
    const file = formData.get('twibbon');

    if (!file) {
      return new Response(JSON.stringify({ error: 'No file uploaded' }), {
        status: 400,
        headers: { 'Content-Type': 'application/json' },
      });
    }

    // Upload file to Vercel Blob
    const blob = await put(file.name, file, {
      access: 'public',
    });

    return new Response(
      JSON.stringify({
        message: 'Twibbon uploaded successfully!',
        url: blob.url,
      }),
      {
        status: 200,
        headers: { 'Content-Type': 'application/json' },
      }
    );
  } catch (error) {
    console.error('Upload error:', error);
    return new Response(JSON.stringify({ error: 'Upload failed' }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' },
    });
  }
}
