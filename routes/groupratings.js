const express = require('express');

const {
  getGroupRatings,
  getGroupRating,
  addGroupRating,
  updateGroupRating,
  deleteGroupRating
} = require('../controllers/groupratings');

const GroupRating = require('../models/GroupRating');

const router = express.Router({ mergeParams: true });

const advancedResults = require('../middleware/advancedResults');
const { protect, authorize } = require('../middleware/auth');

router
  .route('/')
  .get(
    advancedResults(GroupRating, {
      path: 'usergroup',
      select: 'name'
    }),
    getGroupRatings
  )
  .post(protect, authorize('operator', 'admin'), addGroupRating);

router
  .route('/:id')
  .get(getGroupRating)
  .put(protect, authorize('operator', 'admin'), updateGroupRating)
  .delete(protect, authorize('operator', 'admin'), deleteGroupRating);

module.exports = router;
