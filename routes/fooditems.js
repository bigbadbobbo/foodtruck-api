const express = require('express');

const {
  getFoodItems,
  getFoodItem,
  addFoodItem,
  updateFoodItem,
  deleteFoodItem,
  fooditemPhotoUpload
} = require('../controllers/fooditems');

const FoodItem = require('../models/FoodItem');

const router = express.Router({ mergeParams: true });

const advancedResults = require('../middleware/advancedResults');
const { protect, authorize } = require('../middleware/auth');

router
  .route('/:id/photo')
  .put(protect, authorize('operator', 'admin'), fooditemPhotoUpload);

router
  .route('/')
  .get(
    advancedResults(FoodItem, {
      path: 'foodtruck',
      select: 'name'
    }),
    getFoodItems
  )
  .post(protect, authorize('operator', 'admin'), addFoodItem);

router
  .route('/:id')
  .get(getFoodItem)
  .put(protect, authorize('operator', 'admin'), updateFoodItem)
  .delete(protect, authorize('operator', 'admin'), deleteFoodItem);

module.exports = router;
