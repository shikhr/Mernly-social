import express from 'express';
import multer, { memoryStorage } from 'multer';
import {
  deleteAvatar,
  followUser,
  getProfile,
  postAvatar,
  unfollowUser,
  updateProfile,
} from '../controllers/userController.js';

const router = express.Router();

router.route('/follow/:followId').put(followUser);

router.route('/unfollow/:unfollowId').put(unfollowUser);

router.route('/profile/:id').get(getProfile);
router.route('/profile').patch(updateProfile);

const upload = multer({
  limits: {
    fileSize: 1000000,
  },
  fileFilter(req, file, callback) {
    if (!/^image\/(jpe?g|png)$/.test(file.mimetype)) {
      return callback(new Error('Not an image file'));
    }
    callback(null, true);
  },
  storage: memoryStorage(),
});

router
  .route('/avatar')
  .post(upload.single('avatar'), postAvatar)
  .delete(deleteAvatar);

export default router;