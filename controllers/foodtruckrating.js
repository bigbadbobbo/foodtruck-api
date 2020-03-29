const ErrorResponse = require('../utils/errorResponse');
const asyncHandler = require('../middleware/async');
const FoodTruckRating = require('../models/FoodTruckRating');
const User = require('../models/User');
const Foodtruck = require('../models/Foodtruck');

// @desc    Get FoodTruckRatings
// @route   GET /api/v1/foodtruckrating
// @route   GET /api/v1/foodtrucks/:foodtruckId/foodtruckrating
// @access  Public
exports.getFoodTruckRatings = asyncHandler(async (req, res, next) => {
  if (req.params.foodtruckId) {
    const foodtruckratings = await FoodTruckRating.find({
      foodtruck: req.params.foodtruckId
    });

    return res.status(200).json({
      success: true,
      count: foodtruckratings.length,
      data: foodtruckratings
    });
  } else {
    res.status(200).json(res.advancedResults);
  }
});

// @desc    Get single food truck rating
// @route   GET /api/v1/foodtruckrating/:id
// @access  Public
exports.getFoodTruckRating = asyncHandler(async (req, res, next) => {
  const test = await FoodTruckRating.findById(req.params.id);

  if (!test) {
    return next(
      new ErrorResponse(`No review found with the id of ${req.params.id}`, 404)
    );
  }

  const rating = await FoodTruckRating.findById(req.params.id).populated({
    path: 'foodtruck',
    select: 'name description'
  });

  res.status(200).json({
    success: true,
    data: rating
  });
});

// @desc    Add food truck rating
// @route   POST /api/v1/foodtrucks/:foodtruckId/foodtruckrating
// @access  Private
exports.addFoodTruckRating = asyncHandler(async (req, res, next) => {
  req.body.foodtruck = req.params.foodtruckId;
  req.body.user = req.user.id;

  const foodtruck = await Foodtruck.findById(req.params.foodtruckId);

  if (!foodtruck) {
    return next(
      new ErrorResponse(
        `There is no foodtruck with an id of ${req.params.foodtruckId}`,
        404
      )
    );
  }

  const rating = await FoodTruckRating.create(req.body);

  res.status(201).json({
    success: true,
    data: rating
  });
});

// @desc    Update food truck rating
// @route   PUT /api/v1/foodtruckrating/:id
// @access  Private
exports.updateFoodTruckRating = asyncHandler(async (req, res, next) => {
  let rating = await FoodTruckRating.findById(req.params.id);

  if (!rating) {
    return next(
      new ErrorResponse(
        `There is no rating with an id of ${req.params.id}`,
        404
      )
    );
  }

  // Make sure rating belongs to user or user is an admin
  if (rating.user.toString() !== req.user.id && req.user.role !== 'admin') {
    return next(new ErrorResponse(`Not authorized to update review`, 401));
  }

  rating = await FoodTruckRating.findByIdAndUpdate(req.params.id, req.body, {
    new: true,
    runValidators: true
  });

  res.status(200).json({
    success: true,
    data: rating
  });
});

// @desc    Delete food truck rating
// @route   DELETE /api/v1/foodtruckrating/:id
// @access  Private
exports.deleteFoodTruckRating = asyncHandler(async (req, res, next) => {
  const rating = await FoodTruckRating.findById(req.params.id);

  if (!rating) {
    return next(
      new ErrorResponse(
        `There is no rating with an id of ${req.params.id}`,
        404
      )
    );
  }

  // Make sure rating belongs to user or user is an admin
  if (rating.user.toString() !== req.user.id && req.user.role !== 'admin') {
    return next(new ErrorResponse(`Not authorized to update review`, 401));
  }

  await rating.remove();

  res.status(200).json({
    success: true,
    data: rating
  });
});
