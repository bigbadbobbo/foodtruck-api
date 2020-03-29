const ErrorResponse = require('../utils/errorResponse');
const asyncHandler = require('../middleware/async');
const PersonalOrder = require('../models/PersonalOrder');
const Foodtruck = require('../models/Foodtruck');

// @desc    Get personal orders
// @route   GET /api/v1/personalorders
// @route   GET /api/v1/users/:userId/personalorders
// @route   GET /api/v1/foodtrucks/:foodtruckId/personalorders
// @access  Public
exports.getPersonalOrders = asyncHandler(async (req, res, next) => {
  if (req.params.userId) {
    const personalorders = await PersonalOrder.find({
      user: req.params.userId
    });

    return res.status(200).json({
      success: true,
      count: personalorders.length,
      data: personalorders
    });
  } else if (req.params.foodtruckId) {
    const personalorders = await PersonalOrder.find({
      foodtruck: req.params.foodtruckId
    });

    return res.status(200).json({
      success: true,
      count: personalorders.length,
      data: personalorders
    });
  } else {
    res.status(200).json(res.advancedResults);
  }
});

// @desc    Get a Single Personal Order
// @route   GET /api/v1/personalorders/:id
// @access  Public
exports.getPersonalOrder = asyncHandler(async (req, res, next) => {
  const personalorder = await PersonalOrder.findById(req.params.id);

  if (!personalorder) {
    return next(
      new ErrorResponse(`No personal order with the id of ${req.params.id}`),
      404
    );
  }

  res.status(200).json({
    success: true,
    data: personalorder
  });
});

// @desc    Add personal order
// @route   POST /api/v1/foodtrucks/:id/personalorders
// @access  Private
exports.addPersonalOrder = asyncHandler(async (req, res, next) => {
  req.body.user = req.user.id;
  req.body.foodtruck = req.params.foodtruckId;

  // Make sure the group exists
  const foodtruck = await Foodtruck.findById(req.params.foodtruckId);

  if (!foodtruck) {
    return next(
      new ErrorResponse(`There is no foodtruck with id ${req.params.id}`, 404)
    );
  }

  // Make sure user is not a foodtruck operator
  if (req.user.role == 'operator') {
    return next(
      new ErrorResponse(
        `User ${req.user.id} is not authorized to make orders`,
        401
      )
    );
  }

  const personalorder = await PersonalOrder.create(req.body);

  res.status(200).json({
    success: true,
    data: personalorder
  });
});

// @desc    Delete Personal Order
// @route   DELETE /api/v1/personalorders/:id
// @access  Private
exports.deletePersonalOrder = asyncHandler(async (req, res, next) => {
  const personalorder = await PersonalOrder.findById(req.params.id);

  if (!personalorder) {
    return next(
      new ErrorResponse(`No personal order with the id of ${req.params.id}`),
      404
    );
  }

  // Make sure user is the person placing the order
  if (
    personalorder.user.toString() != req.user.id &&
    req.user.role != 'admin'
  ) {
    return next(
      new ErrorResponse(
        `User ${req.user.id} is not authorized to delete personal order ${req.params.id}`,
        401
      )
    );
  }

  await personalorder.remove();

  res.status(200).json({
    success: true,
    data: personalorder
  });
});
