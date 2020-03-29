const express = require('express');
const {
  register,
  login,
  logout,
  getMe,
  forgotPassword,
  resetPassword,
  updateDetails,
  updatePassword,
  updateLocation
} = require('../controllers/auth');

const router = express.Router();

const { protect } = require('../middleware/auth');

router.post('/register', register);
router.post('/login', login);
router.get('/me', protect, getMe);
router.get('/logout', protect, logout);
router.post('/forgotpassword', forgotPassword);
router.put('/resetPassword/:resettoken', resetPassword);
router.put('/updatedetails', protect, updateDetails);
router.put('/updatePassword', protect, updatePassword);
router.put('/updateLocation', protect, updateLocation);

module.exports = router;
