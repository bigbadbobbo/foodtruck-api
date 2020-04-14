const path = require('path');
const ErrorResponse = require('../utils/errorResponse');
const asyncHandler = require('../middleware/async');
const Foodtruck = require('../models/Foodtruck');

// @desc    Get all Food Trucks
// @route   GET /api/v1/foodtrucks
// @access  Public
exports.getFoodTrucks = asyncHandler(async (req, res, next) => {
  res.status(200).json(res.advancedResults);
});

// @desc    Create new Food Truck
// @route   POST /api/v1/foodtrucks
// @access  Private
exports.createFoodTruck = asyncHandler(async (req, res, next) => {
  // Add user to req.body
  req.body.user = req.user.id;

  // Check for other food truck
  const existingFoodTruck = await Foodtruck.findOne({ user: req.user.id });

  // If the user is not an admin, they can only add one food truck

  if (existingFoodTruck && req.user.role != 'admin') {
    return next(
      new ErrorResponse(
        `The user with ID ${req.user.id} is already operating a food truck`,
        400
      )
    );
  }

  const foodtruck = await Foodtruck.create(req.body);

  res.status(201).json({
    success: true,
    data: foodtruck
  });
});

// @desc    Get single Food Truck
// @route   GET /api/v1/foodtrucks/:id
// @access  Public
exports.getFoodTruck = asyncHandler(async (req, res, next) => {
  const foodtruck = await Foodtruck.findById(req.params.id);

  if (!foodtruck) {
    return next(
      new ErrorResponse(`Foodtruck not found with id of ${req.params.id}`, 404)
    );
  }

  res.status(200).json({ success: true, data: foodtruck });
});

// @desc    Update Food Truck
// @route   PUT /api/v1/foodtrucks/:id
// @access  Private
exports.updateFoodTruck = asyncHandler(async (req, res, next) => {
  let foodtruck = await Foodtruck.findById(req.params.id);

  if (!foodtruck) {
    return next(
      new ErrorResponse(`Foodtruck not found with id of ${req.params.id}`, 404)
    );
  }

  // Make sure user is foodtruck operator
  if (foodtruck.user.toString() !== req.user.id && req.user.role !== 'admin') {
    return next(
      new ErrorResponse(
        `User ${req.user.id} is not authorized to update this food truck`,
        401
      )
    );
  }

  foodtruck = await Foodtruck.findOneAndUpdate(req.params.id, req.body, {
    new: true,
    runValidators: true
  });

  res.status(200).json({ success: true, data: foodtruck });
});

// @desc    Delete single Food Truck
// @route   DELETE /api/v1/foodtrucks/:id
// @access  Private
exports.deleteFoodTruck = asyncHandler(async (req, res, next) => {
  const foodtruck = await Foodtruck.findById(req.params.id);

  if (!foodtruck) {
    return next(
      new ErrorResponse(`Foodtruck not found with id of ${req.params.id}`, 404)
    );
  }

  // Make sure user is foodtruck operator
  if (foodtruck.user.toString() !== req.user.id && req.user.role !== 'admin') {
    return next(
      new ErrorResponse(
        `User ${req.user.id} is not authorized to delete this food truck`,
        401
      )
    );
  }

  foodtruck.remove();

  res.status(200).json({ success: true, data: foodtruck });
});

// @desc    Get bootcamps within a radius
// @route   GET /api/v1/foodtrucks/radius/:lat/:lng/:distance
// @access  Public
exports.getFoodtrucksInRadius = asyncHandler(async (req, res, next) => {
  const { lat, lng, distance } = req.params;

  // Calculate radius using radians
  // Divide dist by radius of Earth
  // Earth Radius = 3,963 miles / 6,378 km
  const radius = distance / 3963;

  const foodtrucks = await Foodtruck.find({
    location: { $geoWithin: { $centerSphere: [[lng, lat], radius] } }
  });

  res.status(200).json({
    success: true,
    count: foodtrucks.length,
    data: foodtrucks
  });
});

// @desc    Upload photo for food truck
// @route   PUT /api/v1/foodtrucks/:id/photo
// @access  Private
exports.foodTruckPhotoUpload = asyncHandler(async (req, res, next) => {
  const foodtruck = await Foodtruck.findById(req.params.id);

  if (!foodtruck) {
    return next(
      new ErrorResponse(`Foodtruck not found with id of ${req.params.id}`, 404)
    );
  }

  // Make sure user is foodtruck operator
  if (foodtruck.user.toString() !== req.user.id && req.user.role !== 'admin') {
    return next(
      new ErrorResponse(
        `User ${req.user.id} is not authorized to update this food truck`,
        401
      )
    );
  }

  if (!req.files) {
    return next(new ErrorResponse(`Please upload a file`, 400));
  }

  console.log(req.files);

  var file;
  if (req.files.file == null) {
    file = req.files[''];
  } else {
    file = req.files.file;
  }

  console.log(file);

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
  file.name = `photo_${foodtruck._id}${path.parse(file.name).ext}`;

  file.mv(`${process.env.FILE_UPLOAD_PATH}/${file.name}`, async err => {
    if (err) {
      console.error(err);
      return next(new ErrorResponse(`Problem with file upload`, 500));
    }
    await Foodtruck.findByIdAndUpdate(req.params.id, { photo: file.name });

    res.status(200).json({
      success: true,
      data: file.name
    });
  });
});
