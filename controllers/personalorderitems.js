const ErrorResponse = require('../utils/errorResponse');
const asyncHandler = require('../middleware/async');
const FoodItem = require('../models/FoodItem');
const PersonalOrder = require('../models/PersonalOrder');
const PersonalOrderItem = require('../models/PersonalOrderItem');

// @desc    Get personal order items
// @route   GET /api/v1/personalorderitems
// @route   GET /api/v1/personalorders/:poId/personalorderitems
// @access  Public
exports.getPersonalOrderItems = asyncHandler(async (req, res, next) => {
  if (req.params.poiId) {
    const items = await PersonalOrderItem.find({
      personalorder: req.params.poId
    });

    return res.status(200).json({
      success: true,
      count: items.length,
      data: items
    });
  } else {
    res.status(200).json(res.advancedResults);
  }
});

// @desc    Get a Single Personal Order Item
// @route   GET /api/v1/personalorderitems/:id
// @access  Public
exports.getPersonalOrderItem = asyncHandler(async (req, res, next) => {
  const item = await PersonalOrderItem.findById(req.params.id);

  if (!item) {
    return next(
      new ErrorResponse(`No item with the id of ${req.params.id}`),
      404
    );
  }

  res.status(200).json({
    success: true,
    data: item
  });
});

// @desc    Add personal order items
// @route   POST /api/v1/personalorders/:poId/personalorderitems
// @access  Private
exports.addPersonalOrderItem = asyncHandler(async (req, res, next) => {
  req.body.user = req.user.id;
  req.body.personalorder = req.params.poId;

  // Make sure the order exists
  const personalorder = await PersonalOrder.findById(req.params.poId);

  if (!personalorder) {
    return next(
      new ErrorResponse(`There is no order with id ${req.params.poId}`, 404)
    );
  }

  // Make sure user is not a foodtruck operator
  if (
    personalorder.user.toString() != req.user.id &&
    req.user.role != 'admin'
  ) {
    return next(
      new ErrorResponse(
        `User ${req.user.id} is not authorized to add to order ${req.params.poId}`,
        401
      )
    );
  }

  const fi = req.body.fooditem;

  const fooditem = await FoodItem.findById(fi);

  req.body.cost = fooditem.price;

  const personalorderitem = await PersonalOrderItem.create(req.body);

  res.status(200).json({
    success: true,
    data: personalorderitem
  });
});

// @desc    Delete Personal Order Item
// @route   DELETE /api/v1/personalorderitems/:id
// @access  Private
exports.deletePersonalOrderItem = asyncHandler(async (req, res, next) => {
  const personalorderitem = await PersonalOrderItem.findById(req.params.id);

  if (!personalorderitem) {
    return next(
      new ErrorResponse(
        `No personal order item with the id of ${req.params.id}`
      ),
      404
    );
  }

  const personalorder = await PersonalOrder.findById(
    personalorderitem.personalorder
  );

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

  await personalorderitem.remove();

  res.status(200).json({
    success: true,
    data: personalorderitem
  });
});
