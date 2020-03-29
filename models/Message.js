const mongoose = require('mongoose');

const MessageSchema = new mongoose.Schema({
  sender: {
    type: String,
    required: [true, 'Please add a sender'],
    trim: true
  },
  receiver: {
    type: String,
    required: [true, 'Please add a receiver'],
    trim: true
  },
  body: {
    type: String,
    required: [true, 'Please add a message']
  },
  createdAt: {
    type: Date,
    default: Date.now
  }
});

module.exports = mongoose.model('Message', MessageSchema);
