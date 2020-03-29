const mongoose = require('mongoose');

const UserSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.ObjectId,
      ref: 'User',
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
  },
  {
    toJSON: { virtuals: true },
    toObject: { virtuals: true }
  }
);

module.exports = mongoose.model('Membership', UserSchema);
