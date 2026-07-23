const multer = require('multer');
const path = require('path');
const fs = require('fs');
const ApiError = require('../utils/ApiError');

const tmpDir = path.join(__dirname, '..', 'uploads', 'tmp');
if (!fs.existsSync(tmpDir)) fs.mkdirSync(tmpDir, { recursive: true });

const storage = multer.diskStorage({
  destination: (req, file, cb) => cb(null, tmpDir),
  filename: (req, file, cb) => {
    const unique = `${Date.now()}-${Math.round(Math.random() * 1e9)}`;
    cb(null, `${unique}${path.extname(file.originalname)}`);
  },
});

const mediaFileFilter = (req, file, cb) => {
  const allowedMime = [
    'video/mp4', 'video/quicktime', 'video/webm', 'video/x-matroska', 'application/octet-stream',
    'image/jpeg', 'image/png', 'image/webp', 'image/gif', 'image/jpg'
  ];
  const allowedExts = ['.mp4', '.mov', '.webm', '.mkv', '.jpg', '.jpeg', '.png', '.webp', '.gif'];
  const ext = path.extname(file.originalname).toLowerCase();

  if (allowedMime.includes(file.mimetype) || allowedExts.includes(ext)) {
    return cb(null, true);
  }
  cb(new ApiError(400, 'Only video (MP4, MOV, WEBM) or image (JPG, PNG, WEBP) files are allowed'));
};

const imageFileFilter = (req, file, cb) => {
  const allowed = ['image/jpeg', 'image/png', 'image/webp'];
  if (allowed.includes(file.mimetype)) return cb(null, true);
  cb(new ApiError(400, 'Only JPEG, PNG, or WEBP images are allowed'));
};

// 500MB cap for field uploads
const uploadVideo = multer({
  storage,
  fileFilter: mediaFileFilter,
  limits: { fileSize: 500 * 1024 * 1024 },
});

const uploadImage = multer({
  storage,
  fileFilter: imageFileFilter,
  limits: { fileSize: 5 * 1024 * 1024 },
});

module.exports = { uploadVideo, uploadImage, tmpDir };
