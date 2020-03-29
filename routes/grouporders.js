const express = require('express');

const {
  getGroupOrders,
  getGroupOrder,
  addGroupOrder,
  updateGroupOrder,
  deleteGroupOrder
} = require('../controllers/grouporders');

const GroupOrder = require('../models/GroupOrder');

// Include other resource routers
// const groupMemberOrderRouter = require('./groupmemberorders');

const router = express.Router({ mergeParams: true });

const advancedResults = require('../middleware/advancedResults');
const { protect, authorize } = require('../middleware/auth');

// Re-route into other resource routers
// router.use('/:goId/groupmemberorders', groupMemberOrderRouter);

router
  .route('/')
  .get(advancedResults(GroupOrder), getGroupOrders)
  .post(protect, authorize('user', 'admin'), addGroupOrder);

router
  .route('/:id')
  .get(getGroupOrder)
  .put(protect, authorize('user', 'admin'), updateGroupOrder)
  .delete(protect, authorize('user', 'admin'), deleteGroupOrder);

module.exports = router;
