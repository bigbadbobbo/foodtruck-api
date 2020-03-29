const mongoose = require('mongoose');
const slugify = require('slugify');
const geocoder = require('../utils/geocoder');

const FoodtruckSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, 'Please add a name'],
      unique: true,
      trim: true,
      maxlength: [80, 'Name cannot be more than 80 characters']
    },
    slug: String,
    description: {
      type: String,
      required: [true, 'Please add a description'],
      maxlength: [500, 'Description cannot be more than 500 characters']
    },
    centralLocation: {
      type: String
    },
    location: {
      //GeoJSON Point
      type: {
        type: String,
        enum: ['Point']
      },
      coordinates: {
        type: [Number],
        index: '2dsphere'
      },
      formattedAddress: String,
      street: String,
      city: String,
      state: String,
      zipcode: String,
      country: String
    },
    radius: {
      type: Number,
      required: [
        true,
        'Please enter a mile radius you are willing to travel from your central location'
      ]
    },
    minOrder: Number,
    averageRating: {
      type: Number,
      min: [1, 'Rating must be at least 1'],
      max: [10, 'Rating cannot be more than 10']
    },
    photo: {
      type: String,
      default: 'no-foodtruck-photo.jpg'
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
  },
  {
    toJSON: { virtuals: true },
    toObject: { virtuals: true }
  }
);

// Create foodtruck slug from name
FoodtruckSchema.pre('save', function() {
  this.slug = slugify(this.name, { lower: true });
  next();
});

// Geocode & create location field
FoodtruckSchema.pre('save', async function(next) {
  const loc = await geocoder.geocode(this.centralLocation);
  this.location = {
    type: 'Point',
    coordinates: [loc[0].longitude, loc[0].latitude],
    formattedAddress: loc[0].formattedAddress,
    street: loc[0].streetName,
    city: loc[0].city,
    state: loc[0].stateCode,
    zipcode: loc[0].zipcode,
    country: loc[0].countryCode
  };

  // Do not save address in DB
  this.centralLocation = undefined;

  next();
});

// Cascade delete food items when a food truck is deleted
FoodtruckSchema.pre('remove', async function(next) {
  await this.model('FoodItem').deleteMany({ foodtruck: this._id });
  next();
});

// Reverse populate with virtuals
FoodtruckSchema.virtual('fooditems', {
  ref: 'FoodItem',
  localField: '_id',
  foreignField: 'foodtruck',
  justOne: false
});

module.exports = mongoose.model('Foodtruck', FoodtruckSchema);
