import { put } from "@vercel/blob";
import formidable from "formidable";
import fs from "fs";

export const config = {
  api: {
    bodyParser: false,
  },
};

export default async function handler(req, res) {
  if (req.method !== "POST") {
    return res.status(405).json({ message: "Method not allowed" });
  }

  const form = formidable({ multiples: false });

  form.parse(req, async (err, fields, files) => {
    if (err) {
      console.error(err);
      return res.status(500).json({ message: "Form parse error" });
    }

    try {
      const file = files.twibbon[0];
      const fileBuffer = fs.readFileSync(file.filepath);

      const blob = await put(file.originalFilename, fileBuffer, {
        access: "public",
      });

      res.status(200).json({ url: blob.url });
    } catch (error) {
      console.error("Upload error:", error);
      res.status(500).json({ message: "Upload failed" });
    }
  });
}
