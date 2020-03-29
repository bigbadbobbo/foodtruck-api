const mongoose = require('mongoose');

const GroupRatingSchema = new mongoose.Schema({
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
  usergroup: {
    type: mongoose.Schema.ObjectId,
    ref: 'UserGroup',
    required: true
  },
  createdAt: {
    type: Date,
    default: Date.now
  }
});

// Prevent operator from sending more than 1 rating per usergroup
GroupRatingSchema.index({ foodtruck: 1, usergroup: 1 }, { unique: true });

// Static method to get the avg rating and save
GroupRatingSchema.statics.getAverageRating = async function(groupID) {
  const obj = await this.aggregate([
    {
      $match: { usergroup: groupID }
    },
    {
      $group: {
        _id: '$usergroup',
        averageRating: { $avg: '$rating' }
      }
    }
  ]);

  try {
    await this.model('UserGroup').findByIdAndUpdate(userID, {
      averageRating: obj[0].averageRating
    });
  } catch (error) {
    console.error(error);
  }
};

// Call getAverageRating after save
GroupRatingSchema.post('save', function() {
  this.constructor.getAverageRating(this.usergroup);
});

// Call getAverageRating before remove
GroupRatingSchema.post('remove', function() {
  this.constructor.getAverageRating(this.usergroup);
});

module.exports = mongoose.model('GroupRating', GroupRatingSchema);
