const mongoose = require('mongoose');
const slugify = require('slugify');
const geocoder = require('../utils/geocoder');

const UserGroupSchema = new mongoose.Schema(
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
      maxlength: [500, 'Description cannot be more than 500 characters']
    },
    address: {
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
    averageRating: {
      type: Number,
      min: [1, 'Rating must be at least 1'],
      max: [10, 'Rating cannot be more than 10']
    },
    photo: {
      type: String,
      default: 'no-foodtruck-photo.jpg'
    },
    owner: {
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

// Create user group slug from name
UserGroupSchema.pre('save', function() {
  this.slug = slugify(this.name, { lower: true });
  next();
});

// Geocode & create location field
UserGroupSchema.pre('save', async function(next) {
  if (this.address) {
    const loc = await geocoder.geocode(this.address);
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
    this.address = undefined;
  }
  next();
});

/*UserGroupSchema.pre(
  'updateOne',
  { document: true, query: false },
  async function(next) {
    console.log('in middleware');
    console.log(this);
    if (this.address) {
      const loc = await geocoder.geocode(this.address);
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
      this.address = undefined;
    }
    next();
  }
);*/

// Reverse populate with virtuals
UserGroupSchema.virtual('membership', {
  ref: 'Membership',
  localField: '_id',
  foreignField: 'group',
  justOne: false
});

module.exports = mongoose.model('UserGroup', UserGroupSchema);
