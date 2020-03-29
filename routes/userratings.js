const express = require('express');

const {
  getUserRatings,
  getUserRating,
  addUserRating,
  updateUserRating,
  deleteUserRating
} = require('../controllers/userrating');

const UserRating = require('../models/UserRating');

const router = express.Router({ mergeParams: true });

const advancedResults = require('../middleware/advancedResults');
const { protect, authorize } = require('../middleware/auth');

router
  .route('/')
  .get(
    advancedResults(UserRating, {
      path: 'user',
      select: 'name'
    }),
    getUserRatings
  )
  .post(protect, authorize('operator', 'admin'), addUserRating);

router
  .route('/:id')
  .get(getUserRating)
  .put(protect, authorize('operator', 'admin'), updateUserRating)
  .delete(protect, authorize('operator', 'admin'), deleteUserRating);

module.exports = router;
