const express = require('express');
const router = express.Router();
const { protect } = require('../middleware/auth');
const { uploadVideo } = require('../middleware/upload');
const {
  createPost,
  getFeed,
  getNearby,
  getPostById,
  toggleLike,
  registerShare,
  reportPost,
  deletePost,
} = require('../controllers/postController');
const { addComment, getComments } = require('../controllers/commentController');

router.get('/nearby', protect, getNearby);

router
  .route('/')
  .get(protect, getFeed)
  .post(protect, uploadVideo.single('video'), createPost);

router.route('/:id').get(protect, getPostById).delete(protect, deletePost);

router.put('/:id/like', protect, toggleLike);
router.put('/:id/share', protect, registerShare);
router.post('/:id/report', protect, reportPost);

router.route('/:id/comments').get(protect, getComments).post(protect, addComment);

module.exports = router;
