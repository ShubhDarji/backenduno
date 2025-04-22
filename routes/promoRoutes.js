import express from 'express';
import multer from 'multer';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import Video from "../models/Video.js";
const router = express.Router();

// Setup uploads/promotions folder
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const promoUploadDir = path.join(__dirname, '../uploads/promotions');

if (!fs.existsSync(promoUploadDir)) {
  fs.mkdirSync(promoUploadDir, { recursive: true });
}

// Multer setup
const storage = multer.diskStorage({
  destination: (req, file, cb) => cb(null, promoUploadDir),
  filename: (req, file, cb) =>
    cb(null, `${Date.now()}-${file.originalname}`),
});

const upload = multer({
  storage,
  limits: { fileSize: 100 * 1024 * 1024 }, // 100MB limit
  fileFilter: (req, file, cb) => {
    if (file.mimetype.startsWith('video/')) {
      cb(null, true);
    } else {
      cb(new Error('Only video files are allowed'), false);
    }
  },
});

// POST /api/promotions/upload
// POST /api/promotions/upload
router.post('/upload', upload.single('video'), async (req, res) => {
  const { title, description } = req.body;
  const file = req.file;

  if (!file) {
    return res.status(400).json({ message: 'No video file uploaded.' });
  }

  const videoUrl = `${file.filename}`;

  try {
    const savedVideo = await Video.create({
      title,
      description,
      videoUrl,
    });

    res.status(201).json({
      message: 'Video uploaded and saved successfully',
      video: savedVideo,
    });
  } catch (err) {
    console.error("Error saving video to DB:", err);
    res.status(500).json({ message: 'Failed to save video metadata.' });
  }
});

// GET /api/promotions/latest
router.get('/latest', async (req, res) => {
  try {
    const latest = await Video.findOne().sort({ createdAt: -1 });

    if (!latest) {
      return res.status(404).json({ message: 'No promotional video found.' });
    }

    res.status(200).json({
      title: latest.title,
      description: latest.description,
      videoUrl: latest.videoUrl, // Make sure frontend prepends `/uploads/promotions/`
    });
  } catch (err) {
    console.error("Error fetching latest promo video:", err);
    res.status(500).json({ message: "Failed to load promotional video." });
  }
});

export default router;
