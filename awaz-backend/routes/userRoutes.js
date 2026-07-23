const express = require('express');
const router = express.Router();
const { protect } = require('../middleware/auth');
const { uploadImage } = require('../middleware/upload');
const {
  getProfile,
  updateProfile,
  updateAvatar,
  followUser,
  getAllUsers,
  getFollowers,
  getFollowing,
  searchUsers,
} = require('../controllers/userController');

router.get('/', protect, getAllUsers);
router.get('/search', protect, searchUsers);
router.put('/me', protect, updateProfile);
router.put('/me/avatar', protect, uploadImage.single('avatar'), updateAvatar);
router.put('/:id/follow', protect, followUser);
router.get('/:handle', protect, getProfile);
router.get('/:handle/followers', protect, getFollowers);
router.get('/:handle/following', protect, getFollowing);

module.exports = router;
