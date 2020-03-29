const ErrorResponse = require('../utils/errorResponse');
const asyncHandler = require('../middleware/async');
const UserRating = require('../models/UserRating');
const User = require('../models/User');
const Foodtruck = require('../models/Foodtruck');

// @desc    Get UserRatings
// @route   GET /api/v1/userratings
// @route   GET /api/v1/user/:userId/userratings
// @access  Public
exports.getUserRatings = asyncHandler(async (req, res, next) => {
  if (req.params.userId) {
    const userratings = await UserRating.find({
      user: req.params.userId
    });

    return res.status(200).json({
      success: true,
      count: userratings.length,
      data: userratings
    });
  } else {
    res.status(200).json(res.advancedResults);
  }
});

// @desc    Get single user rating
// @route   GET /api/v1/userrating/:id
// @access  Public
exports.getUserRating = asyncHandler(async (req, res, next) => {
  const test = await UserRating.findById(req.params.id);

  if (!test) {
    return next(
      new ErrorResponse(`No review found with the id of ${req.params.id}`, 404)
    );
  }

  const rating = await UserRating.findById(req.params.id).populated({
    path: 'user',
    select: 'name description'
  });

  res.status(200).json({
    success: true,
    data: rating
  });
});

// @desc    Add user rating
// @route   POST /api/v1/users/:userId/userrating
// @access  Private
exports.addUserRating = asyncHandler(async (req, res, next) => {
  // req.body.foodtruck = req.user.id;
  const operatorId = req.user.id;
  req.body.user = req.params.userId;

  const foodtruck = await Foodtruck.findOne({ user: operatorId });

  if (!foodtruck) {
    return next(
      new ErrorResponse(
        `There is no food truck associated with the logged in operator`,
        404
      )
    );
  }

  const user = await User.findById(req.params.userId);

  if (!user) {
    return next(
      new ErrorResponse(
        `There is no user with an id of ${req.params.userId}`,
        404
      )
    );
  }

  req.body.foodtruck = foodtruck;
  const rating = await UserRating.create(req.body);

  res.status(201).json({
    success: true,
    data: rating
  });
});

// @desc    Update user rating
// @route   PUT /api/v1/userrating/:id
// @access  Private
exports.updateUserRating = asyncHandler(async (req, res, next) => {
  let rating = await UserRating.findById(req.params.id);

  if (!rating) {
    return next(
      new ErrorResponse(
        `There is no rating with an id of ${req.params.id}`,
        404
      )
    );
  }

  const foodtruck = await Foodtruck.findOne({ user: req.user.id });

  if (!foodtruck) {
    return next(
      new ErrorResponse(
        `There is no food truck associated with the logged in operator`,
        404
      )
    );
  }

  // Make sure rating belongs to user or user is an admin
  if (
    rating.foodtruck.toString() != foodtruck._id &&
    req.user.role !== 'admin'
  ) {
    return next(new ErrorResponse(`Not authorized to update review`, 401));
  }

  rating = await UserRating.findByIdAndUpdate(req.params.id, req.body, {
    new: true,
    runValidators: true
  });

  res.status(200).json({
    success: true,
    data: rating
  });
});

// @desc    Delete user rating
// @route   DELETE /api/v1/userrating/:id
// @access  Private
exports.deleteUserRating = asyncHandler(async (req, res, next) => {
  const rating = await UserRating.findById(req.params.id);

  if (!rating) {
    return next(
      new ErrorResponse(
        `There is no rating with an id of ${req.params.id}`,
        404
      )
    );
  }

  const foodtruck = await Foodtruck.findOne({ user: req.user.id });

  if (!foodtruck) {
    return next(
      new ErrorResponse(
        `There is no food truck associated with the logged in operator`,
        404
      )
    );
  }

  // Make sure rating belongs to user or user is an admin
  if (
    rating.foodtruck.toString() != foodtruck._id &&
    req.user.role !== 'admin'
  ) {
    return next(new ErrorResponse(`Not authorized to update review`, 401));
  }

  await rating.remove();

  res.status(200).json({
    success: true,
    data: rating
  });
});
