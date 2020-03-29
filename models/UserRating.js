const mongoose = require('mongoose');

const UserRatingSchema = new mongoose.Schema({
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

// Prevent operator from sending more than 1 rating per user
UserRatingSchema.index({ foodtruck: 1, user: 1 }, { unique: true });

// Static method to get the avg rating and save
UserRatingSchema.statics.getAverageRating = async function(userID) {
  const obj = await this.aggregate([
    {
      $match: { user: userID }
    },
    {
      $group: {
        _id: '$user',
        averageRating: { $avg: '$rating' }
      }
    }
  ]);

  try {
    await this.model('User').findByIdAndUpdate(userID, {
      averageRating: obj[0].averageRating
    });
  } catch (error) {
    console.error(error);
  }
};

// Call getAverageRating after save
UserRatingSchema.post('save', function() {
  this.constructor.getAverageRating(this.user);
});

// Call getAverageRating before remove
UserRatingSchema.post('remove', function() {
  this.constructor.getAverageRating(this.user);
});

module.exports = mongoose.model('UserRating', UserRatingSchema);
