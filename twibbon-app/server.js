const express = require('express');
const multer = require('multer');
const sharp = require('sharp');
const path = require('path');
const fs = require('fs');
const { exec } = require('child_process');

const app = express();
app.use(express.json()); // Middleware to parse JSON request bodies
app.use(express.static('public'));
app.use('/processed', express.static('processed'));

// Ensure necessary directories exist
['uploads', 'processed'].forEach(dir => {
  if (!fs.existsSync(dir)) fs.mkdirSync(dir);
});

// Multer storage for uploaded files
const storage = multer.diskStorage({
  destination: 'uploads/',
  filename: (req, file, cb) => {
    cb(null, Date.now() + path.extname(file.originalname));
  }
});
const upload = multer({ storage });

let twibbonPath = null; // Store Twibbon path globally

// Upload Twibbon
app.post('/upload-twibbon', upload.single('twibbon'), (req, res) => {
  if (!req.file) return res.status(400).send('No Twibbon file uploaded.');
  twibbonPath = req.file.path;
  res.send('Twibbon uploaded successfully!');
});

// Process images by overlaying Twibbon
app.post('/process', upload.array('images'), async (req, res) => {
  if (!twibbonPath) return res.status(400).send('Please upload a Twibbon first.');

  try {
    const twibbonMetadata = await sharp(twibbonPath).metadata();
    const twibbonAspectRatio = twibbonMetadata.width / twibbonMetadata.height;

    const processedImages = [];

    for (const file of req.files) {
      const outputPath = `processed/${Date.now()}-${file.originalname}`;
      const fileName = path.basename(outputPath);

      // Get image metadata
      const imageMetadata = await sharp(file.path).metadata();
      const imageAspectRatio = imageMetadata.width / imageMetadata.height;

      let resizedPhoto;
      if (Math.abs(imageAspectRatio - twibbonAspectRatio) < 0.1) {
        // ✅ Similar aspect ratio → Stretch to fit Twibbon exactly
        resizedPhoto = await sharp(file.path)
          .resize(twibbonMetadata.width, twibbonMetadata.height, { fit: 'fill' }) // Stretch to fit
          .toBuffer();
      } else {
        // ❌ Different aspect ratio → Resize and add padding to match Twibbon size
        resizedPhoto = await sharp(file.path)
          .resize(twibbonMetadata.width, twibbonMetadata.height, { fit: 'contain', background: { r: 255, g: 255, b: 255, alpha: 1 } }) // Fit within, add white padding
          .toBuffer();
      }

      // Overlay the Twibbon on top of the processed image
      await sharp(resizedPhoto)
        .composite([{ input: twibbonPath, gravity: 'center' }])
        .toFile(outputPath);

      processedImages.push({ path: `/${outputPath}`, name: fileName });

      await fs.promises.unlink(file.path);
    }

    res.json({ processedImages });
  } catch (error) {
    console.error('Error processing images:', error);
    res.status(500).send('Failed to process images.');
  }
});





// Print processed images
app.post('/print', (req, res) => {
  const { printerName } = req.body;
  if (!printerName) return res.status(400).send('No printer selected.');

  const images = fs.readdirSync('processed');
  if (images.length === 0) return res.status(400).send('No images to print.');

  images.forEach(image => {
    const imagePath = path.join(__dirname, 'processed', image);
    exec(`lp -d "${printerName}" "${imagePath}"`, (error, stdout, stderr) => {
      if (error) console.error(`Error printing ${imagePath}:`, error.message);
      if (stderr) console.error(`Printer stderr:`, stderr);
      else console.log(`Printed ${imagePath}:`, stdout);
    });
  });

  res.send('Printing started');
});

// Mock printer list endpoint
app.get('/printers', (req, res) => {
  res.json([{ name: 'Printer 1' }, { name: 'Printer 2' }, { name: 'Printer 3' }]);
});

// Start the server
const PORT = 4000;
app.listen(PORT, () => console.log(`Server running at http://127.0.0.1:${PORT}/`));