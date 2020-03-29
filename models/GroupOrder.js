const mongoose = require('mongoose');

const GroupOrderSchema = new mongoose.Schema(
  {
    usergroup: {
      type: mongoose.Schema.ObjectId,
      ref: 'UserGroup',
      required: true
    },
    foodtruck: {
      type: mongoose.Schema.ObjectId,
      ref: 'Foodtruck',
      required: true
    },
    isPlaced: Boolean,
    whenPlaced: Date,
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
GroupOrderSchema.statics.getTotal = async function(grouporderID) {
  const obj = await this.aggregate([
    {
      $match: { grouporder: grouporderID }
    },
    {
      $group: {
        _id: '$grouporder',
        cost: { $sum: '$cost' }
      }
    }
  ]);

  try {
    await this.model('GroupOrder').findByIdAndUpdate(grouporderID, {
      cost: obj[0].cost
    });
  } catch (error) {
    console.error(error);
  }
};

// Reverse populate with virtuals
GroupOrderSchema.virtual('groupmemberorder', {
  ref: 'GroupMemberOrder',
  localField: '_id',
  foreignField: 'grouporder',
  justOne: false
});

module.exports = mongoose.model('GroupOrder', GroupOrderSchema);
