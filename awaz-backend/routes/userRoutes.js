const express = require('express');
const router = express.Router();
const { protect } = require('../middleware/auth');
const { uploadImage } = require('../middleware/upload');
const {
  getProfile,
  updateProfile,
  updateAvatar,
  followUser,
} = require('../controllers/userController');

router.put('/me', protect, updateProfile);
router.put('/me/avatar', protect, uploadImage.single('avatar'), updateAvatar);
router.put('/:id/follow', protect, followUser);
router.get('/:handle', protect, getProfile);

module.exports = router;
