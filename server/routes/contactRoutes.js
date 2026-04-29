const router = require('express').Router();
const { sendEnquiry } = require('../controllers/contactController');

router.post('/', sendEnquiry);

module.exports = router;
