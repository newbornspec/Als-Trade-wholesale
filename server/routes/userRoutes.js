const router  = require('express').Router();
const { register, login, getMe, updateMe, verifyEmailToken, resendVerification } = require('../controllers/userController');
const { protect } = require('../middleware/authMiddleware');

// Public
router.post('/register',             register);
router.post('/login',                login);
router.get('/verify-email',          verifyEmailToken);   // clicked from email link
router.post('/resend-verification',  resendVerification);

// Protected — must be logged in
router.get('/me',   protect, getMe);
router.patch('/me', protect, updateMe);

module.exports = router;
