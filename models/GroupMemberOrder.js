const mongoose = require('mongoose');

const GroupMemberOrderSchema = new mongoose.Schema(
  {
    grouporder: {
      type: mongoose.Schema.ObjectId,
      ref: 'GroupOrder',
      required: true
    },
    personalorder: {
      type: mongoose.Schema.ObjectId,
      ref: 'PersonalOrder',
      required: true
    },
    instructions: {
      type: String,
      maxlength: [500, 'Instructions cannot be more than 500 characters']
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
GroupMemberOrderSchema.statics.getTotal = async function(grouporderID) {
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

// Call getTotalCosts after save
GroupMemberOrderSchema.post('save', function() {
  this.constructor.getTotal(this.grouporder);
});

// Call getTotalCosts before remove
GroupMemberOrderSchema.post('remove', function() {
  this.constructor.getTotal(this.grouporder);
});

module.exports = mongoose.model('GroupMemberOrder', GroupMemberOrderSchema);
