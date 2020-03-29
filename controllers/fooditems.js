const path = require('path');
const ErrorResponse = require('../utils/errorResponse');
const asyncHandler = require('../middleware/async');
const FoodItem = require('../models/FoodItem');
const Foodtruck = require('../models/Foodtruck');

// @desc    Get FoodItems
// @route   GET /api/v1/fooditems
// @route   GET /api/v1/foodtrucks/:foodtruckId/fooditems
// @access  Public
exports.getFoodItems = asyncHandler(async (req, res, next) => {
  if (req.params.foodtruckId) {
    const fooditems = await FoodItem.find({
      foodtruck: req.params.foodtruckId
    });

    return res.status(200).json({
      success: true,
      count: fooditems.length,
      data: fooditems
    });
  } else {
    res.status(200).json(res.advancedResults);
  }
});

// @desc    Get Single FoodItem
// @route   GET /api/v1/fooditems/:id
// @access  Public
exports.getFoodItem = asyncHandler(async (req, res, next) => {
  const fooditem = await FoodItem.findById(req.params.id).populate({
    path: 'foodtruck',
    select: 'name'
  });

  if (!fooditem) {
    return next(
      new ErrorResponse(`No food item with the id of ${req.params.id}`),
      404
    );
  }

  res.status(200).json({
    success: true,
    data: fooditem
  });
});

// @desc    Add FoodItem
// @route   POST /api/v1/foodtrucks/:foodtruckId/fooditems
// @access  Private
exports.addFoodItem = asyncHandler(async (req, res, next) => {
  req.body.foodtruck = req.params.foodtruckId;
  req.body.user = req.user.id;

  const foodtruck = await Foodtruck.findById(req.params.foodtruckId);

  if (!foodtruck) {
    return next(
      new ErrorResponse(
        `No food truck with the id of ${req.params.foodtruckId}`
      ),
      404
    );
  }

  // Make sure user is foodtruck operator
  if (foodtruck.user.toString() !== req.user.id && req.user.role !== 'admin') {
    return next(
      new ErrorResponse(
        `User ${req.user.id} is not authorized to add a food item for food truck ${foodtruck._id}`,
        401
      )
    );
  }

  const fooditem = await FoodItem.create(req.body);

  res.status(200).json({
    success: true,
    data: fooditem
  });
});

// @desc    Update FoodItem
// @route   PUT /api/v1/fooditems/:id
// @access  Private
exports.updateFoodItem = asyncHandler(async (req, res, next) => {
  let fooditem = await FoodItem.findById(req.params.id);

  if (!fooditem) {
    return next(
      new ErrorResponse(`No food item with the id of ${req.params.id}`),
      404
    );
  }

  // Make sure user is fooditem operator
  if (fooditem.user.toString() !== req.user.id && req.user.role !== 'admin') {
    return next(
      new ErrorResponse(
        `User ${req.user.id} is not authorized to update food item ${fooditem._id}`,
        401
      )
    );
  }

  fooditem = await FoodItem.findByIdAndUpdate(req.params.id, req.body, {
    new: true,
    runValidators: true
  });

  res.status(200).json({
    success: true,
    data: fooditem
  });
});

// @desc    Delete FoodItem
// @route   DELETE /api/v1/fooditems/:id
// @access  Private
exports.deleteFoodItem = asyncHandler(async (req, res, next) => {
  const fooditem = await FoodItem.findById(req.params.id);

  if (!fooditem) {
    return next(
      new ErrorResponse(`No food item with the id of ${req.params.id}`),
      404
    );
  }

  // Make sure user is fooditem operator
  if (fooditem.user.toString() !== req.user.id && req.user.role !== 'admin') {
    return next(
      new ErrorResponse(
        `User ${req.user.id} is not authorized to delete food item ${fooditem._id}`,
        401
      )
    );
  }

  await fooditem.remove();

  res.status(200).json({
    success: true,
    data: fooditem
  });
});

// @desc    Upload Photo for Food Item
// @route   PUT /api/v1/fooditems/:id/photo
// @access  Private
exports.fooditemPhotoUpload = asyncHandler(async (req, res, next) => {
  const fooditem = await FoodItem.findById(req.params.id);

  if (!fooditem) {
    return next(
      new ErrorResponse(`No food item with the id of ${req.params.id}`),
      404
    );
  }

  // Make sure user is fooditem operator
  if (fooditem.user.toString() !== req.user.id && req.user.role !== 'admin') {
    return next(
      new ErrorResponse(
        `User ${req.user.id} is not authorized to update food item ${fooditem._id}`,
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
    await FoodItem.findByIdAndUpdate(req.params.id, { photo: file.name });

    res.status(200).json({
      success: true,
      data: file.name
    });
  });
});
