const express = require('express');

const {
  getMessages,
  getMessage,
  addMessage
} = require('../controllers/messages');

const Message = require('../models/Message');

const router = express.Router({ mergeParams: true });

const advancedResults = require('../middleware/advancedResults');
const { protect } = require('../middleware/auth');

router
  .route('/')
  .get(advancedResults(Message), getMessages)
  .post(protect, addMessage);

router.route('/:id').get(getMessage);

module.exports = router;
