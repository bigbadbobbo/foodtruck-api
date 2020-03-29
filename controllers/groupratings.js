const ErrorResponse = require('../utils/errorResponse');
const asyncHandler = require('../middleware/async');
const GroupRating = require('../models/GroupRating');
const UserGroup = require('../models/UserGroup');
const Foodtruck = require('../models/Foodtruck');

// @desc    Get GroupRatings
// @route   GET /api/v1/groupratings
// @route   GET /api/v1/usergroup/:groupId/groupratings
// @access  Public
exports.getGroupRatings = asyncHandler(async (req, res, next) => {
  if (req.params.groupId) {
    const groupratings = await GroupRating.find({
      usergroup: req.params.groupId
    });

    return res.status(200).json({
      success: true,
      count: groupratings.length,
      data: groupratings
    });
  } else {
    res.status(200).json(res.advancedResults);
  }
});

// @desc    Get single group rating
// @route   GET /api/v1/groupratings/:id
// @access  Public
exports.getGroupRating = asyncHandler(async (req, res, next) => {
  const test = await GroupRating.findById(req.params.id);

  if (!test) {
    return next(
      new ErrorResponse(`No review found with the id of ${req.params.id}`, 404)
    );
  }

  const rating = await GroupRating.findById(req.params.id).populate({
    path: 'groupuser',
    select: 'name'
  });

  res.status(200).json({
    success: true,
    data: rating
  });
});

// @desc    Add group rating
// @route   POST /api/v1/usergroups/:groupId/groupratings
// @access  Private
exports.addGroupRating = asyncHandler(async (req, res, next) => {
  // req.body.foodtruck = req.user.id;
  const operatorId = req.user.id;
  req.body.usergroup = req.params.groupId;

  const foodtruck = await Foodtruck.findOne({ user: operatorId });

  if (!foodtruck) {
    return next(
      new ErrorResponse(
        `There is no food truck associated with the logged in operator`,
        404
      )
    );
  }

  const group = await UserGroup.findById(req.params.groupId);

  if (!group) {
    return next(
      new ErrorResponse(
        `There is no group with an id of ${req.params.userId}`,
        404
      )
    );
  }

  req.body.foodtruck = foodtruck;
  const rating = await GroupRating.create(req.body);

  res.status(201).json({
    success: true,
    data: rating
  });
});

// @desc    Update group rating
// @route   PUT /api/v1/groupratings/:id
// @access  Private
exports.updateGroupRating = asyncHandler(async (req, res, next) => {
  let rating = await GroupRating.findById(req.params.id);

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

  rating = await GroupRating.findByIdAndUpdate(req.params.id, req.body, {
    new: true,
    runValidators: true
  });

  res.status(200).json({
    success: true,
    data: rating
  });
});

// @desc    Delete group rating
// @route   DELETE /api/v1/groupratings/:id
// @access  Private
exports.deleteGroupRating = asyncHandler(async (req, res, next) => {
  const rating = await GroupRating.findById(req.params.id);

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
