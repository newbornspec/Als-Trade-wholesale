const router  = require('express').Router();
const { register, login, getMe, updateMe, verifyOTP, resendOTP } = require('../controllers/userController');
const { protect } = require('../middleware/authMiddleware');

// Public
router.post('/register',   register);
router.post('/login',      login);
router.post('/verify-otp', verifyOTP);
router.post('/resend-otp', resendOTP);

// Protected — must be logged in
router.get('/me',   protect, getMe);
router.patch('/me', protect, updateMe);

module.exports = router;
