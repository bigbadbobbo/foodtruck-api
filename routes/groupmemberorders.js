const express = require('express');

const {
  getGroupMemberOrders,
  getGroupMemberOrder,
  addGroupMemberOrder,
  updateGroupMemberOrder,
  deleteGroupMemberOrder
} = require('../controllers/groupmemberorders');

const GroupMemberOrder = require('../models/GroupMemberOrder');

const router = express.Router({ mergeParams: true });

const advancedResults = require('../middleware/advancedResults');
const { protect, authorize } = require('../middleware/auth');

router
  .route('/')
  .get(advancedResults(GroupMemberOrder), getGroupMemberOrders)
  .post(protect, authorize('user', 'admin'), addGroupMemberOrder);

router
  .route('/:id')
  .get(getGroupMemberOrder)
  .put(protect, authorize('user', 'admin'), updateGroupMemberOrder)
  .delete(protect, authorize('user', 'admin'), deleteGroupMemberOrder);

module.exports = router;
