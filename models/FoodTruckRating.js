const mongoose = require('mongoose');
const colors = require('colors');

const FoodTruckRatingSchema = new mongoose.Schema({
  rating: {
    type: Number,
    min: 1,
    max: 10,
    required: [true, 'Please add a rating between 1 (worst) and 10 (best)']
  },
  foodtruck: {
    type: mongoose.Schema.ObjectId,
    ref: 'Foodtruck',
    required: true
  },
  user: {
    type: mongoose.Schema.ObjectId,
    ref: 'User',
    required: true
  },
  createdAt: {
    type: Date,
    default: Date.now
  }
});

// Prevent user from sending more than 1 rating per foodtruck
FoodTruckRatingSchema.index({ foodtruck: 1, user: 1 }, { unique: true });

// Static method to get the avg rating and save
FoodTruckRatingSchema.statics.getAverageRating = async function(foodtruckID) {
  const obj = await this.aggregate([
    {
      $match: { foodtruck: foodtruckID }
    },
    {
      $group: {
        _id: '$foodtruck',
        averageRating: { $avg: '$rating' }
      }
    }
  ]);

  try {
    await this.model('Foodtruck').findByIdAndUpdate(foodtruckID, {
      averageRating: obj[0].averageRating
    });
  } catch (error) {
    console.error(error);
  }
};

// Call getAverageRating after save
FoodTruckRatingSchema.post('save', function() {
  this.constructor.getAverageRating(this.foodtruck);
});

// Call getAverageRating before remove
FoodTruckRatingSchema.post('remove', function() {
  this.constructor.getAverageRating(this.foodtruck);
});

module.exports = mongoose.model('FoodTruckRating', FoodTruckRatingSchema);
