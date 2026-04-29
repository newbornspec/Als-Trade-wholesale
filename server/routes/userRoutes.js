const router  = require('express').Router();
const { register, login, getMe, updateMe } = require('../controllers/userController');
const { protect } = require('../middleware/authMiddleware');

// Public
router.post('/register', register);
router.post('/login',    login);

// Protected — must be logged in
router.get('/me',    protect, getMe);
router.patch('/me',  protect, updateMe);

module.exports = router;
