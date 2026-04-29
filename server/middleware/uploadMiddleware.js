const multer = require('multer');
const path   = require('path');
const fs     = require('fs');

// Ensure upload directories exist
['uploads/batches', 'uploads/lists'].forEach(dir => {
  if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });
});

const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    // PDFs go to uploads/lists, images to uploads/batches
    const dir = file.mimetype === 'application/pdf' ? 'uploads/lists' : 'uploads/batches';
    cb(null, dir);
  },
  filename: (req, file, cb) => {
    const batchNum = req.body.batchNumber || 'batch';
    const ext      = path.extname(file.originalname).toLowerCase();
    cb(null, `${batchNum}-${Date.now()}${ext}`);
  },
});

const fileFilter = (req, file, cb) => {
  const allowed = ['.jpg', '.jpeg', '.png', '.webp', '.pdf'];
  const ext     = path.extname(file.originalname).toLowerCase();
  if (allowed.includes(ext)) {
    cb(null, true);
  } else {
    cb(new Error('Only JPG, PNG, WebP and PDF files are allowed'), false);
  }
};

const upload = multer({
  storage,
  fileFilter,
  limits: { fileSize: 10 * 1024 * 1024 }, // 10MB max
});

module.exports = upload;
