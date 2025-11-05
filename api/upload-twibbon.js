// api/upload-twibbon.js
import formidable from "formidable";
import fs from "fs";

export const config = {
  api: {
    bodyParser: false, // Disables Next.js default parser (important for FormData)
  },
};

export default async function handler(req, res) {
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  const form = formidable({ multiples: false });

  form.parse(req, (err, fields, files) => {
    if (err) {
      console.error("Form parse error:", err);
      return res.status(500).json({ error: "Error parsing the file." });
    }

    const file = files.twibbon?.[0];
    if (!file) {
      return res.status(400).json({ error: "No file uploaded." });
    }

    console.log("Uploaded Twibbon:", file.originalFilename);

    // (Optional) Save or process the file here
    // For example, move it or upload to Cloudinary, S3, etc.

    return res.status(200).json({
      message: "Twibbon uploaded successfully!",
      fileName: file.originalFilename,
    });
  });
}
