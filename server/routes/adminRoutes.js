const router  = require('express').Router();
const { getStats, getEnquiries, markEnquiryRead, deleteEnquiry, getUsers, deleteUser } = require('../controllers/adminController');
const { protect, admin } = require('../middleware/authMiddleware');

// All admin routes require login + admin role
router.use(protect, admin);

router.get('/stats',                   getStats);
router.get('/enquiries',               getEnquiries);
router.patch('/enquiries/:id/read',    markEnquiryRead);
router.delete('/enquiries/:id',        deleteEnquiry);
router.get('/users',                   getUsers);
router.delete('/users/:id',            deleteUser);

module.exports = router;
