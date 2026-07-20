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

const videoFileFilter = (req, file, cb) => {
  const allowed = ['video/mp4', 'video/quicktime', 'video/webm', 'video/x-matroska'];
  if (allowed.includes(file.mimetype)) return cb(null, true);
  cb(new ApiError(400, 'Only MP4, MOV, WEBM, or MKV video files are allowed'));
};

const imageFileFilter = (req, file, cb) => {
  const allowed = ['image/jpeg', 'image/png', 'image/webp'];
  if (allowed.includes(file.mimetype)) return cb(null, true);
  cb(new ApiError(400, 'Only JPEG, PNG, or WEBP images are allowed'));
};

// 500MB cap for field video — matches the frontend's drag-and-drop limit
const uploadVideo = multer({
  storage,
  fileFilter: videoFileFilter,
  limits: { fileSize: 500 * 1024 * 1024 },
});

const uploadImage = multer({
  storage,
  fileFilter: imageFileFilter,
  limits: { fileSize: 5 * 1024 * 1024 },
});

module.exports = { uploadVideo, uploadImage, tmpDir };
