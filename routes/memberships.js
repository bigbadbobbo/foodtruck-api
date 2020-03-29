const express = require('express');

const {
  getMemberships,
  getMembership,
  addMembership,
  deleteMembership
} = require('../controllers/memberships');

const Membership = require('../models/Membership');

const router = express.Router({ mergeParams: true });

const advancedResults = require('../middleware/advancedResults');
const { protect, authorize } = require('../middleware/auth');

router
  .route('/')
  .get(advancedResults(Membership), getMemberships)
  .post(protect, authorize('user', 'admin'), addMembership);

router
  .route('/:id')
  .get(getMembership)
  .delete(protect, authorize('user', 'admin'), deleteMembership);

module.exports = router;
