const router  = require('express').Router();
const { getStats, getEnquiries, markEnquiryRead, getUsers } = require('../controllers/adminController');
const { protect, admin } = require('../middleware/authMiddleware');

// All admin routes require login + admin role
router.use(protect, admin);

router.get('/stats',                   getStats);
router.get('/enquiries',               getEnquiries);         // ?unread=true
router.patch('/enquiries/:id/read',    markEnquiryRead);
router.get('/users',                   getUsers);

module.exports = router;
