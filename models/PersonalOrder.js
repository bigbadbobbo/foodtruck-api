const mongoose = require('mongoose');

const PersonalOrderSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.ObjectId,
      ref: 'User',
      required: true
    },
    foodtruck: {
      type: mongoose.Schema.ObjectId,
      ref: 'Foodtruck',
      required: true
    },
    cost: Number,
    createdAt: {
      type: Date,
      default: Date.now
    }
  },
  {
    toJSON: { virtuals: true },
    toObject: { virtuals: true }
  }
);

// Static method to get the total costs and save
PersonalOrderSchema.statics.getTotalCosts = async function(personalorderID) {
  const obj = await this.aggregate([
    {
      $match: { personalorder: personalorderID }
    },
    {
      $group: {
        _id: '$personorder',
        cost: { $sum: '$cost' }
      }
    }
  ]);

  try {
    await this.model('PersonalOrder').findByIdAndUpdate(personalorderID, {
      cost: obj[0].cost
    });
  } catch (error) {
    console.error(error);
  }
};

// Reverse populate with virtuals
PersonalOrderSchema.virtual('personalorderitem', {
  ref: 'PersonalOrderItem',
  localField: '_id',
  foreignField: 'personalorder',
  justOne: false
});

module.exports = mongoose.model('PersonalOrder', PersonalOrderSchema);
