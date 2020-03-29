const path = require('path');
const ErrorResponse = require('../utils/errorResponse');
const asyncHandler = require('../middleware/async');
const UserGroup = require('../models/UserGroup');

// @desc    Get user groups
// @route   GET /api/v1/usergroups
// @route   GET /api/v1/users/:userId/usergroups
// @access  Public
exports.getUserGroups = asyncHandler(async (req, res, next) => {
  if (req.params.userId) {
    const usergroups = await UserGroup.find({
      owner: req.params.userId
    });

    return res.status(200).json({
      success: true,
      count: usergroups.length,
      data: usergroups
    });
  } else {
    res.status(200).json(res.advancedResults);
  }
});

// @desc    Get Single User Group
// @route   GET /api/v1/usergroups/:id
// @access  Public
exports.getUserGroup = asyncHandler(async (req, res, next) => {
  const usergroup = await UserGroup.findById(req.params.id).populate({
    path: 'owner',
    select: 'name'
  });

  if (!usergroup) {
    return next(
      new ErrorResponse(`No user group with the id of ${req.params.id}`),
      404
    );
  }

  res.status(200).json({
    success: true,
    data: usergroup
  });
});

// @desc    Add User Group
// @route   POST /api/v1/usergroups
// @access  Private
exports.addUserGroup = asyncHandler(async (req, res, next) => {
  req.body.owner = req.user.id;

  // Make sure user is not a foodtruck operator
  if (req.user.role == 'operator') {
    return next(
      new ErrorResponse(
        `User ${req.user.id} is not authorized to add a food item for food truck ${foodtruck._id}`,
        401
      )
    );
  }

  const usergroup = await UserGroup.create(req.body);

  res.status(200).json({
    success: true,
    data: usergroup
  });
});

// @desc    Update User Group
// @route   PUT /api/v1/usergroups/:id
// @access  Private
exports.updateUserGroup = asyncHandler(async (req, res, next) => {
  let usergroup = await UserGroup.findById(req.params.id);

  if (!usergroup) {
    return next(
      new ErrorResponse(`No user group with the id of ${req.params.id}`),
      404
    );
  }

  // Make sure user is the user group owner
  if (usergroup.owner.toString() != req.user.id && req.user.role != 'admin') {
    return next(
      new ErrorResponse(
        `User ${req.user.id} is not authorized to update user group ${fooditem._id}`,
        401
      )
    );
  }

  usergroup = await UserGroup.findByIdAndUpdate(req.params.id, req.body, {
    new: true,
    runValidators: true
  });

  res.status(200).json({
    success: true,
    data: usergroup
  });
});

// @desc    Delete User Group
// @route   DELETE /api/v1/usergroups/:id
// @access  Private
exports.deleteUserGroup = asyncHandler(async (req, res, next) => {
  const usergroup = await UserGroup.findById(req.params.id);

  if (!usergroup) {
    return next(
      new ErrorResponse(`No user group with the id of ${req.params.id}`),
      404
    );
  }

  // Make sure user is food group operator
  if (usergroup.owner.toString() != req.user.id && req.user.role != 'admin') {
    return next(
      new ErrorResponse(
        `User ${req.user.id} is not authorized to delete user group ${fooditem._id}`,
        401
      )
    );
  }

  await usergroup.remove();

  res.status(200).json({
    success: true,
    data: usergroup
  });
});

// @desc    Upload Photo for User Group
// @route   PUT /api/v1/usergroups/:id/photo
// @access  Private
exports.userGroupPhotoUpload = asyncHandler(async (req, res, next) => {
  const usergroup = await UserGroup.findById(req.params.id);

  if (!usergroup) {
    return next(
      new ErrorResponse(`No user group with the id of ${req.params.id}`),
      404
    );
  }

  // Make sure user is user group owner
  if (usergroup.owner.toString() != req.user.id && req.user.role != 'admin') {
    return next(
      new ErrorResponse(
        `User ${req.user.id} is not authorized to update user group ${fooditem._id}`,
        401
      )
    );
  }

  if (!req.files) {
    return next(new ErrorResponse(`Please upload a file`, 400));
  }

  const file = req.files.file;

  // Make sure the image is a photo
  if (!file.mimetype.startsWith('image')) {
    return next(new ErrorResponse(`Please upload an image file`, 400));
  }

  // Check filesize
  if (file.size > process.env.MAX_FILE_UPLOAD) {
    return next(
      new ErrorResponse(
        `Please upload an image less than ${process.env.MAX_FILE_UPLOAD} bytes`,
        400
      )
    );
  }

  // Create custom filename
  file.name = `photo_${fooditem._id}${path.parse(file.name).ext}`;

  file.mv(`${process.env.FILE_UPLOAD_PATH}/${file.name}`, async err => {
    if (err) {
      console.error(err);
      return next(new ErrorResponse(`Problem with file upload`, 500));
    }
    await UserGroup.findByIdAndUpdate(req.params.id, { photo: file.name });

    res.status(200).json({
      success: true,
      data: file.name
    });
  });
});
