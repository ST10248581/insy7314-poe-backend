const express = require('express');
const router = express.Router();
const slowDown = require('express-slow-down');

const { registerUser } = require('../controllers/authController');
const { loginUser } = require('../controllers/loginController');
const { logoutUser } = require('../controllers/logoutController');
const { verifyMFA } = require('../controllers/mfaController');
const { validateRegistration } = require('../middleware/validateInput');
const { validateLogin } = require('../middleware/validateLogin');

// Anti brute-force limiter
const loginSpeedLimiter = slowDown({
  windowMs: 15 * 60 * 1000,
  delayAfter: 5,
  delayMs: (used, req) => {
    const delayAfter = req.slowDown.limit;
    const delay = (used - delayAfter) * 1000;
    console.log(`Delaying login for IP ${req.ip} by ${delay}ms`);
    return delay;
  },
});

// Routes
router.post('/register', validateRegistration, registerUser);
router.post('/login', loginSpeedLimiter, validateLogin, loginUser);
router.post('/verify-mfa', verifyMFA);
router.post('/logout', logoutUser);

module.exports = router;
