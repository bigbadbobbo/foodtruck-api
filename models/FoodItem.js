const mongoose = require('mongoose');

const FoodItemSchema = new mongoose.Schema({
  title: {
    type: String,
    trim: true,
    required: [true, 'Please add a title']
  },
  description: String,
  ingredients: String,
  nutrition: String,
  price: {
    type: Number,
    required: [true, 'Please add a price']
  },
  photo: {
    type: String,
    default: 'no-fooditem-photo.jpg'
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

module.exports = mongoose.model('FoodItem', FoodItemSchema);
