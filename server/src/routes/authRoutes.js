const express = require('express');
const router = express.Router();

const { register, login, logout, getMe, changePassword } = require('../controllers/authController');
const { protect } = require('../middleware/auth');
const {
  validateRegister,
  validateLogin,
  validateChangePassword,
} = require('../middleware/validate');

router.post('/register', validateRegister, register);
router.post('/login', validateLogin, login);
router.post('/logout', protect, logout);
router.get('/me', protect, getMe);
router.put('/change-password', protect, validateChangePassword, changePassword);

module.exports = router;
