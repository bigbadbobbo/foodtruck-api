const ErrorResponse = require('../utils/errorResponse');
const asyncHandler = require('../middleware/async');
const Membership = require('../models/Membership');
const UserGroup = require('../models/UserGroup');

// @desc    Get memberships
// @route   GET /api/v1/memberships
// @route   GET /api/v1/users/:userId/memberships
// @route   GET /api/v1/usergroups/:groupId/memberships
// @access  Public
exports.getMemberships = asyncHandler(async (req, res, next) => {
  if (req.params.userId) {
    const memberships = await Membership.find({
      user: req.params.userId
    });

    return res.status(200).json({
      success: true,
      count: memberships.length,
      data: memberships
    });
  } else if (req.params.groupId) {
    const memberships = await Membership.find({
      usergroup: req.params.groupId
    });

    return res.status(200).json({
      success: true,
      count: memberships.length,
      data: memberships
    });
  } else {
    res.status(200).json(res.advancedResults);
  }
});

// @desc    Get Membership
// @route   GET /api/v1/memberships/:id
// @access  Public
exports.getMembership = asyncHandler(async (req, res, next) => {
  const membership = await Membership.findById(req.params.id);

  if (!membership) {
    return next(
      new ErrorResponse(`No membership with the id of ${req.params.id}`),
      404
    );
  }

  res.status(200).json({
    success: true,
    data: membership
  });
});

// @desc    Add Membership
// @route   POST /api/v1/usergroups/:id/memberships
// @access  Private
exports.addMembership = asyncHandler(async (req, res, next) => {
  req.body.user = req.user.id;
  req.body.usergroup = req.params.id;

  // Make sure the group exists
  const usergroup = await UserGroup.findById(req.params.id);

  if (!usergroup) {
    return next(
      new ErrorResponse(`There is no group with id ${req.params.id}`, 404)
    );
  }

  // Make sure user is not a foodtruck operator
  if (req.user.role == 'operator') {
    return next(
      new ErrorResponse(
        `User ${req.user.id} is not authorized to join groups`,
        401
      )
    );
  }

  const membership = await Membership.create(req.body);

  res.status(200).json({
    success: true,
    data: membership
  });
});

// @desc    Delete Membership
// @route   DELETE /api/v1/membership/:id
// @access  Private
exports.deleteMembership = asyncHandler(async (req, res, next) => {
  const membership = await Membership.findById(req.params.id);

  if (!membership) {
    return next(
      new ErrorResponse(`No membership with the id of ${req.params.id}`),
      404
    );
  }

  // Make sure user is membership owner
  if (membership.user.toString() != req.user.id && req.user.role != 'admin') {
    return next(
      new ErrorResponse(
        `User ${req.user.id} is not authorized to delete membership ${req.params.id}`,
        401
      )
    );
  }

  await membership.remove();

  res.status(200).json({
    success: true,
    data: membership
  });
});
