const express = require('express');

const {
  getPersonalOrderItems,
  getPersonalOrderItem,
  addPersonalOrderItem,
  deletePersonalOrderItem
} = require('../controllers/personalorderitems');

const PersonalOrderItem = require('../models/PersonalOrderItem');

const router = express.Router({ mergeParams: true });

const advancedResults = require('../middleware/advancedResults');
const { protect, authorize } = require('../middleware/auth');

router
  .route('/')
  .get(advancedResults(PersonalOrderItem), getPersonalOrderItems)
  .post(protect, authorize('user', 'admin'), addPersonalOrderItem);

router
  .route('/:id')
  .get(getPersonalOrderItem)
  .delete(protect, authorize('user', 'admin'), deletePersonalOrderItem);

module.exports = router;
