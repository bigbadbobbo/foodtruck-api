const ErrorResponse = require('../utils/errorResponse');
const asyncHandler = require('../middleware/async');
const Message = require('../models/Message');

// @desc    Get messages
// @route   GET /api/v1/messages
// @access  Public
exports.getMessages = asyncHandler(async (req, res, next) => {
  res.status(200).json(res.advancedResults);
});

// @desc    Get messages
// @route   GET /api/v1/messages/:id
// @access  Public
exports.getMessage = asyncHandler(async (req, res, next) => {
  const message = await Message.findById(req.params.id);

  if (!message) {
    return next(
      new ErrorResponse(`No message with the id of ${req.params.id}`),
      404
    );
  }

  res.status(200).json({
    success: true,
    data: message
  });
});

// @desc    Add message
// @route   POST /api/v1/message
// @access  Private
// NOTE: specify a receiver and a message in the body
// NOTE: verify receiver on the front-end
exports.addMessage = asyncHandler(async (req, res, next) => {
  req.body.sender = req.user.id;

  const message = await Message.create(req.body);

  res.status(200).json({
    success: true,
    data: message
  });
});
