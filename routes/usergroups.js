const express = require('express');

const {
  getUserGroup,
  getUserGroups,
  addUserGroup,
  updateUserGroup,
  deleteUserGroup,
  userGroupPhotoUpload
} = require('../controllers/usergroups');

const UserGroup = require('../models/UserGroup');

// Include other resource routers
const membershipRouter = require('./memberships');
const groupRatingRouter = require('./groupratings');

const router = express.Router({ mergeParams: true });

const advancedResults = require('../middleware/advancedResults');
const { protect, authorize } = require('../middleware/auth');

// Re-route into other resource routers
router.use('/:id/memberships', membershipRouter);
router.use('/:groupId/groupratings', groupRatingRouter);

router
  .route('/:id/photo')
  .put(protect, authorize('user', 'admin'), userGroupPhotoUpload);

router
  .route('/')
  .get(advancedResults(UserGroup), getUserGroups)
  .post(protect, authorize('user', 'admin'), addUserGroup);

router
  .route('/:id')
  .get(getUserGroup)
  .put(protect, authorize('user', 'admin'), updateUserGroup)
  .delete(protect, authorize('user', 'admin'), deleteUserGroup);

module.exports = router;
