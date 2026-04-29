const router  = require('express').Router();
const {
  getAvailable, getSold, getOne,
  createBatch, updateBatch, markSold, deleteBatch,
} = require('../controllers/batchController');
const { softAuth, protect, admin } = require('../middleware/authMiddleware');
const upload = require('../middleware/uploadMiddleware');

// ── Public reads (softAuth so price visibility works) ─────────────────────
router.get('/',         softAuth, getAvailable);   // ?category=laptops&search=apple
router.get('/sold',     getSold);
router.get('/:slug',    softAuth, getOne);

// ── Admin writes ──────────────────────────────────────────────────────────
router.post(
  '/',
  protect, admin,
  upload.array('images', 10), // up to 10 images per batch
  createBatch
);

router.put(
  '/:id',
  protect, admin,
  upload.array('images', 10),
  updateBatch
);

router.patch('/:id/sold',  protect, admin, markSold);
router.delete('/:id',      protect, admin, deleteBatch);

module.exports = router;
