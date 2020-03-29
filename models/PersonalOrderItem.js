const mongoose = require('mongoose');

const PersonalOrderItemSchema = new mongoose.Schema(
  {
    personalorder: {
      type: mongoose.Schema.ObjectId,
      ref: 'PersonalOrder',
      required: true
    },
    fooditem: {
      type: mongoose.Schema.ObjectId,
      ref: 'FoodItem',
      required: true
    },
    customization: {
      type: String,
      maxlength: [500, 'Description cannot be more than 500 characters']
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
PersonalOrderItemSchema.statics.getTotalCosts = async function(
  personalorderID
) {
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

// Call getTotalCosts after save
PersonalOrderItemSchema.post('save', function() {
  this.constructor.getTotalCosts(this.personalorder);
});

// Call getTotalCosts before remove
PersonalOrderItemSchema.post('remove', function() {
  this.constructor.getTotalCosts(this.personalorder);
});

module.exports = mongoose.model('PersonalOrderItem', PersonalOrderItemSchema);
