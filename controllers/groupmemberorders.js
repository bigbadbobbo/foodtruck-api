const ErrorResponse = require('../utils/errorResponse');
const asyncHandler = require('../middleware/async');
const GroupOrder = require('../models/GroupOrder');
const PersonalOrder = require('../models/PersonalOrder');
const Membership = require('../models/Membership');
const GroupMemberOrder = require('../models/GroupMemberOrder');

// @desc    Get GroupMemberOrders
// @route   GET /api/v1/groupmemberorders
// @access  Public
exports.getGroupMemberOrders = asyncHandler(async (req, res, next) => {
  res.status(200).json(res.advancedResults);
});

// @desc    Get a Single GroupMemberOrder
// @route   GET /api/v1/groupmemberorders/:id
// @access  Public
exports.getGroupMemberOrder = asyncHandler(async (req, res, next) => {
  const groupmemberorder = await GroupMemberOrder.findById(req.params.id);

  if (!groupmemberorder) {
    return next(
      new ErrorResponse(`No group order with the id of ${req.params.id}`),
      404
    );
  }

  res.status(200).json({
    success: true,
    data: groupmemberorder
  });
});

// @desc    Add groupmemberorder
// @route   POST /api/v1/groupmemberorders
// @access  Private
exports.addGroupMemberOrder = asyncHandler(async (req, res, next) => {
  req.body.user = req.user.id;

  // Make sure the grouporder exists
  if (!req.body.grouporder) {
    return next(new ErrorResponse(`No group order specified`, 404));
  }

  const grouporder = await GroupOrder.findById(req.body.grouporder);
  if (!grouporder) {
    return next(
      new ErrorResponse(
        `There is no group order with id ${req.body.grouporder}`,
        404
      )
    );
  }

  // Make sure the personalorder exists
  if (!req.body.personalorder) {
    return next(new ErrorResponse(`No personal order specified`, 404));
  }
  const personalorder = await PersonalOrder.findById(req.body.personalorder);
  if (!personalorder) {
    return next(
      new ErrorResponse(
        `There is no personal order with id ${req.body.personalorder}`,
        404
      )
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
        `User ${req.user.id} is not authorized to update group member order ${req.params.id}`,
        401
      )
    );
  }

  const groupmemberorder = await GroupMemberOrder.create(req.body);

  res.status(200).json({
    success: true,
    data: groupmemberorder
  });
});

// @desc    Update GroupMemberOrder
// @route   PUT /api/v1/groupmemberorders/:id
// @access  Private
exports.updateGroupMemberOrder = asyncHandler(async (req, res, next) => {
  let groupmemberorder = await GroupMemberOrder.findById(req.params.id);

  if (!groupmemberorder) {
    return next(
      new ErrorResponse(`No groupmemberorder with the id of ${req.params.id}`),
      404
    );
  }

  // Make sure user is a member of the group
  const grouporder = GroupOrder.findById(groupmemberorder.grouporder);

  if (!grouporder) {
    return next(
      new ErrorResponse(
        `No grouporder with the id of ${groupmemberorder.grouporder}`
      ),
      404
    );
  }

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

  groupmemberorder = await GroupMemberOrder.findByIdAndUpdate(
    req.params.id,
    req.body,
    {
      new: true,
      runValidators: true
    }
  );

  res.status(200).json({
    success: true,
    data: groupmemberorder
  });
});

// @desc    Delete GroupMemberOrder
// @route   DELETE /api/v1/groupmemberorders/:id
// @access  Private
exports.deleteGroupMemberOrder = asyncHandler(async (req, res, next) => {
  let groupmemberorder = await GroupMemberOrder.findById(req.params.id);

  if (!groupmemberorder) {
    return next(
      new ErrorResponse(`No groupmemberorder with the id of ${req.params.id}`),
      404
    );
  }

  // Make sure user is a member of the group
  const grouporder = GroupOrder.findById(groupmemberorder.grouporder);

  if (!grouporder) {
    return next(
      new ErrorResponse(
        `No grouporder with the id of ${groupmemberorder.grouporder}`
      ),
      404
    );
  }

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

  await groupmemberorder.remove();

  res.status(200).json({
    success: true,
    data: groupmemberorder
  });
});
