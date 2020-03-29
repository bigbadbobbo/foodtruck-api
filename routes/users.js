const express = require('express');

const {
  getUsers,
  getUser,
  createUser,
  updateUser,
  deleteUser
} = require('../controllers/users');

const User = require('../models/User');

// Include other resource routers
const userRatingRouter = require('./userratings');
const userGroupRouter = require('./usergroups');
const membershipRouter = require('./memberships');
const personalOrderRouter = require('./personalorders');

const router = express.Router({ mergeParams: true });

const advancedResults = require('../middleware/advancedResults');
const { protect, authorize } = require('../middleware/auth');

// Re-route into other resource routers
router.use('/:userId/userrating', userRatingRouter);
router.use('/:userId/usergroups', userGroupRouter);
router.use('/:userId/memberships', membershipRouter);
router.use('/:userId/personalorders', personalOrderRouter);

router.use(protect);
router.use(authorize('admin'));

router
  .route('/')
  .get(advancedResults(User), getUsers)
  .post(createUser);

router
  .route('/:id')
  .get(getUser)
  .put(updateUser)
  .delete(deleteUser);

module.exports = router;
