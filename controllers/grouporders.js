const ErrorResponse = require('../utils/errorResponse');
const asyncHandler = require('../middleware/async');
const GroupOrder = require('../models/GroupOrder');
const Foodtruck = require('../models/Foodtruck');
const UserGroup = require('../models/UserGroup');
const Membership = require('../models/Membership');

// @desc    Get group orders
// @route   GET /api/v1/grouporders
// @access  Public
exports.getGroupOrders = asyncHandler(async (req, res, next) => {
  res.status(200).json(res.advancedResults);
});

// @desc    Get a Single Group Order
// @route   GET /api/v1/grouporders/:id
// @access  Public
exports.getGroupOrder = asyncHandler(async (req, res, next) => {
  const grouporder = await GroupOrder.findById(req.params.id);

  if (!grouporder) {
    return next(
      new ErrorResponse(`No group order with the id of ${req.params.id}`),
      404
    );
  }

  res.status(200).json({
    success: true,
    data: grouporder
  });
});

// @desc    Add group order
// @route   POST /api/v1/grouporders
// @access  Private
exports.addGroupOrder = asyncHandler(async (req, res, next) => {
  req.body.user = req.user.id;

  // Make sure the foodtruck exists
  if (!req.body.foodtruck) {
    return next(new ErrorResponse(`No food truck specified`, 404));
  }
  const ft = req.body.foodtruck;
  const foodtruck = await Foodtruck.findById(ft);
  if (!foodtruck) {
    return next(
      new ErrorResponse(
        `There is no foodtruck with id ${req.body.foodtruck}`,
        404
      )
    );
  }

  // Make sure the group exists
  if (!req.body.usergroup) {
    return next(new ErrorResponse(`No food truck specified`, 404));
  }
  const ug = req.body.usergroup;
  const usergroup = await UserGroup.findById(ug);
  if (!usergroup) {
    return next(
      new ErrorResponse(`There is no group with id ${req.body.usergroup}`, 404)
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

  const grouporder = await GroupOrder.create(req.body);

  res.status(200).json({
    success: true,
    data: grouporder
  });
});

// @desc    Update Group Order
// @route   PUT /api/v1/grouporders/:id
// @access  Private
exports.updateGroupOrder = asyncHandler(async (req, res, next) => {
  let grouporder = await GroupOrder.findById(req.params.id);

  if (!grouporder) {
    return next(
      new ErrorResponse(`No group order with the id of ${req.params.id}`),
      404
    );
  }

  // Make sure user is a member of the group
  const membership = Membership.findOne({
    user: req.user.id,
    usergroup: grouporder.usergroup
  });

  if (!membership && req.user.role != 'admin') {
    return next(
      new ErrorResponse(
        `User ${req.user.id} is not authorized to update group order ${req.params.id}`,
        401
      )
    );
  }

  grouporder = await GroupOrder.findByIdAndUpdate(req.params.id, req.body, {
    new: true,
    runValidators: true
  });

  res.status(200).json({
    success: true,
    data: grouporder
  });
});

// @desc    Delete Group Order
// @route   DELETE /api/v1/grouporders/:id
// @access  Private
exports.deleteGroupOrder = asyncHandler(async (req, res, next) => {
  const grouporder = await GroupOrder.findById(req.params.id);

  if (!grouporder) {
    return next(
      new ErrorResponse(`No group order with the id of ${req.params.id}`),
      404
    );
  }

  // Make sure user is the person placing the order
  if (req.user.role != 'admin') {
    return next(
      new ErrorResponse(
        `User ${req.user.id} is not authorized to delete group order ${req.params.id}`,
        401
      )
    );
  }

  await grouporder.remove();

  res.status(200).json({
    success: true,
    data: grouporder
  });
});
