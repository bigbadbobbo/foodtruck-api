const express = require('express');

const {
  getFoodTruckRatings,
  getFoodTruckRating,
  addFoodTruckRating,
  updateFoodTruckRating,
  deleteFoodTruckRating
} = require('../controllers/foodtruckrating');

const FoodTruckRating = require('../models/FoodTruckRating');

const router = express.Router({ mergeParams: true });

const advancedResults = require('../middleware/advancedResults');
const { protect, authorize } = require('../middleware/auth');

router
  .route('/')
  .get(
    advancedResults(FoodTruckRating, {
      path: 'foodtruck',
      select: 'name'
    }),
    getFoodTruckRatings
  )
  .post(protect, authorize('user', 'admin'), addFoodTruckRating);

router
  .route('/:id')
  .get(getFoodTruckRating)
  .put(protect, authorize('user', 'admin'), updateFoodTruckRating)
  .delete(protect, authorize('user', 'admin'), deleteFoodTruckRating);

module.exports = router;
