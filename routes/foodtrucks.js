const express = require('express');

const {
  getFoodTrucks,
  getFoodTruck,
  createFoodTruck,
  updateFoodTruck,
  deleteFoodTruck,
  getFoodtrucksInRadius,
  foodTruckPhotoUpload
} = require('../controllers/foodtrucks');

const Foodtruck = require('../models/Foodtruck');

// Include other resource routers
const foodItemRouter = require('./fooditems');
const foodTruckRatingRouter = require('./foodtruckratings');
const personalOrderRouter = require('./personalorders');

const router = express.Router();

const { protect, authorize } = require('../middleware/auth');
const advancedResults = require('../middleware/advancedResults');

// Re-route into other resource routers
router.use('/:foodtruckId/fooditems', foodItemRouter);
router.use('/:foodtruckId/foodtruckrating', foodTruckRatingRouter);
router.use('/:foodtruckId/personalorders', personalOrderRouter);

router.route('/radius/:lat/:lng/:distance').get(getFoodtrucksInRadius);

router
  .route('/:id/photo')
  .put(protect, authorize('operator', 'admin'), foodTruckPhotoUpload);

router
  .route('/')
  .get(advancedResults(Foodtruck, 'courses'), getFoodTrucks)
  .post(protect, authorize('operator', 'admin'), createFoodTruck);

router
  .route('/:id')
  .get(getFoodTruck)
  .put(protect, authorize('operator', 'admin'), updateFoodTruck)
  .delete(protect, authorize('operator', 'admin'), deleteFoodTruck);

module.exports = router;
