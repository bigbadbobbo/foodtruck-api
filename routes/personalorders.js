const express = require('express');

const {
  getPersonalOrders,
  getPersonalOrder,
  addPersonalOrder,
  deletePersonalOrder
} = require('../controllers/personalorders');

const PersonalOrder = require('../models/PersonalOrder');

// Include other resource routers
const personalOrderItemRouter = require('./personalorderitems');

const router = express.Router({ mergeParams: true });

const advancedResults = require('../middleware/advancedResults');
const { protect, authorize } = require('../middleware/auth');

// Re-route into other resource routers
router.use('/:poId/personalorderitems', personalOrderItemRouter);

router
  .route('/')
  .get(advancedResults(PersonalOrder), getPersonalOrders)
  .post(protect, authorize('user', 'admin'), addPersonalOrder);

router
  .route('/:id')
  .get(getPersonalOrder)
  .delete(protect, authorize('user', 'admin'), deletePersonalOrder);

module.exports = router;
