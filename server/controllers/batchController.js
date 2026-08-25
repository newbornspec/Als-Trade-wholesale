const path       = require('path');
const Batch      = require('../models/Batch');
const cloudinary = require('cloudinary').v2;

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key:    process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

// Ceiling on ?limit so a caller cannot ask for an unbounded page.
const MAX_PAGE_SIZE = 100;

// Longest search term we will match on. Bounds the work per document.
const MAX_SEARCH_LENGTH = 80;

// Turns a user-supplied value into a literal, case-insensitive substring match.
//
// Feeding raw input to `new RegExp` let a caller send a pattern rather than a
// search term. `?search=(a%2B)%2B%24` is a classic catastrophic-backtracking
// pattern, and Mongo evaluates it against every document in the collection, so
// a single request could pin the database. Escaping the metacharacters means
// the term can only ever match itself, literally.
//
// Non-strings are rejected outright: Express parses `?brand[$ne]=x` into an
// object, and query values must never be anything but text here.
const literalMatch = (value) => {
  if (typeof value !== 'string') return null;
  const term = value.trim().slice(0, MAX_SEARCH_LENGTH);
  if (!term) return null;
  return new RegExp(term.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'), 'i');
};

const IMAGE_EXTS = ['.jpg','.jpeg','.jfif','.png','.webp','.gif','.bmp','.tiff','.tif','.heic','.heif'];
const isImageFile = (originalname) => IMAGE_EXTS.includes(path.extname(originalname).toLowerCase());

const MIME_MAP = {
  '.pdf':  'application/pdf',
  '.xlsx': 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
  '.xls':  'application/vnd.ms-excel',
  '.csv':  'text/csv',
  '.doc':  'application/msword',
  '.docx': 'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
  '.txt':  'text/plain',
  '.zip':  'application/zip',
  '.ppt':  'application/vnd.ms-powerpoint',
  '.pptx': 'application/vnd.openxmlformats-officedocument.presentationml.presentation',
};

const getMime = (originalname) => {
  const ext = path.extname(originalname).toLowerCase();
  return MIME_MAP[ext] || 'application/octet-stream';
};

const uploadImage = (buffer, originalname, folder) => {
  return new Promise((resolve, reject) => {
    cloudinary.uploader.upload_stream(
      { folder, resource_type: 'image', use_filename: true, unique_filename: true },
      (error, result) => {
        if (error) reject(error);
        else resolve(result.secure_url);
      }
    ).end(buffer);
  });
};

const uploadRawFile = (buffer, originalname, folder) => {
  const mime     = getMime(originalname);
  const ext      = path.extname(originalname).slice(1);
  const baseName = path.basename(originalname, path.extname(originalname));
  const dataUri  = `data:${mime};base64,${buffer.toString('base64')}`;

  return new Promise((resolve, reject) => {
    cloudinary.uploader.upload(dataUri, {
      folder, resource_type: 'raw',
      public_id: baseName, format: ext,
      use_filename: true, unique_filename: true,
    }, (error, result) => {
      if (error) reject(error);
      else resolve(result.secure_url);
    });
  });
};

const uploadToCloudinary = (buffer, originalname, folder) => {
  if (isImageFile(originalname)) return uploadImage(buffer, originalname, folder);
  return uploadRawFile(buffer, originalname, folder);
};

/* ── GET /api/batches ─────────────────────────────────────────── */
const getAvailable = async (req, res) => {
  try {
    const { category, brand, tested, search, limit, page } = req.query;
    const filter = { status: 'available' };
    // Only ever a string: an object here would reach the query as an operator.
    if (typeof category === 'string' && category && category !== 'all') filter.category = category;
    if (tested) filter.tested = tested === 'true';

    const brandMatch  = literalMatch(brand);
    const searchMatch = literalMatch(search);
    if (brandMatch)  filter.brand = brandMatch;
    if (searchMatch) filter.title = searchMatch;

    // Always report the full count for the filter, never just the page. It is
    // what lets a caller show "9 available" after fetching only three.
    const total = await Batch.countDocuments(filter);
    res.set('X-Total-Count', String(total));

    let query = Batch.find(filter).sort('-createdAt');

    // Paginate only when asked. Without ?limit the response is the same full
    // array it has always been, so existing callers are unaffected.
    const perPage = Math.min(Math.max(parseInt(limit, 10) || 0, 0), MAX_PAGE_SIZE);
    if (perPage) {
      const pageNum = Math.max(parseInt(page, 10) || 1, 1);
      query = query.skip((pageNum - 1) * perPage).limit(perPage);
    }

    const batches = await query;
    const result  = batches.map(b => req.user ? b.toObject() : b.toPublic());
    res.json(result);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

/* ── GET /api/batches/sold ────────────────────────────────────── */
const getSold = async (req, res) => {
  try {
    const batches = await Batch.find({ status: 'sold' }).sort('-soldAt').select('-price');
    res.json(batches);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

/* ── GET /api/batches/:slug ───────────────────────────────────── */
const getOne = async (req, res) => {
  try {
    const batch = await Batch.findOne({ slug: req.params.slug });
    if (!batch) return res.status(404).json({ message: 'Batch not found' });
    res.json(req.user ? batch.toObject() : batch.toPublic());
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

/* ── POST /api/batches ────────────────────────────────────────── */
const createBatch = async (req, res) => {
  try {
    const {
      batchNumber, title, quantity, category, brand,
      description, specs, grade, tested, hasList, price, status, moq,
    } = req.body;

    const images = [];
    let productListFile     = null;
    let productListFileName = null;

    if (req.files && req.files.length > 0) {
      for (const f of req.files) {
        const isImg  = isImageFile(f.originalname);
        const folder = isImg ? 'als-trade/batches' : 'als-trade/lists';
        const url    = await uploadToCloudinary(f.buffer, f.originalname, folder);
        if (isImg) images.push(url);
        else { productListFile = url; productListFileName = f.originalname; }
      }
    }

    const batch = await Batch.create({
      batchNumber, title, quantity, category, brand,
      description, specs, grade,
      tested:  tested  === 'true' || tested  === true,
      hasList: hasList === 'true' || hasList === true,
      price, status, images,
      moq: moq ? Number(moq) : null,
      productListFile,
      productListFileName,
    });

    res.status(201).json(batch);
  } catch (err) {
    if (err.name === 'ValidationError') {
      const messages = Object.values(err.errors).map(e => e.message);
      return res.status(400).json({ message: messages.join('. ') });
    }
    if (err.code === 11000) return res.status(409).json({ message: 'Batch number already exists' });
    res.status(500).json({ message: err.message });
  }
};

/* ── PUT /api/batches/:id ─────────────────────────────────────── */
const updateBatch = async (req, res) => {
  try {
    // Copy only fields that are meant to be editable. Spreading req.body sent
    // whatever the caller supplied straight into findByIdAndUpdate, so a
    // request could set slug, soldAt, currency or _id — or a key beginning
    // with $, which Mongo would read as an update operator rather than a
    // field. Everything not named here is ignored.
    const EDITABLE = [
      'batchNumber', 'title', 'quantity', 'category', 'brand', 'description',
      'specs', 'grade', 'tested', 'hasList', 'price', 'status', 'moq',
    ];
    const updates = {};
    for (const key of EDITABLE) {
      if (req.body[key] !== undefined) updates[key] = req.body[key];
    }
    if (updates.moq) updates.moq = Number(updates.moq);

    const newImages = [];

    if (req.files && req.files.length > 0) {
      for (const f of req.files) {
        const isImg  = isImageFile(f.originalname);
        const folder = isImg ? 'als-trade/batches' : 'als-trade/lists';
        const url    = await uploadToCloudinary(f.buffer, f.originalname, folder);
        if (isImg) newImages.push(url);
        else { updates.productListFile = url; updates.productListFileName = f.originalname; }
      }
    }

    // Handle existing images sent from frontend. These two are instructions
    // from the form rather than stored fields, so they are read from the body
    // directly and never copied into the update.
    const { existingImages, removeFile } = req.body;

    if (existingImages !== undefined) {
      const kept = Array.isArray(existingImages)
        ? existingImages
        : existingImages ? [existingImages] : [];
      updates.images = [...kept, ...newImages];
    } else if (newImages.length > 0) {
      const existing = await Batch.findById(req.params.id).select('images');
      updates.images = [...(existing?.images || []), ...newImages];
    }

    // Handle file removal
    if (removeFile === 'true') {
      updates.productListFile     = null;
      updates.productListFileName = null;
    }

    const batch = await Batch.findByIdAndUpdate(req.params.id, updates, {
      new: true, runValidators: true,
    });
    if (!batch) return res.status(404).json({ message: 'Batch not found' });
    res.json(batch);
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
};

/* ── PATCH /api/batches/:id/sold ─────────────────────────────── */
const markSold = async (req, res) => {
  try {
    const batch = await Batch.findByIdAndUpdate(
      req.params.id, { status: 'sold', soldAt: new Date() }, { new: true }
    );
    if (!batch) return res.status(404).json({ message: 'Batch not found' });
    res.json({ message: 'Marked as sold', batch });
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
};

/* ── DELETE /api/batches/:id ─────────────────────────────────── */
const deleteBatch = async (req, res) => {
  try {
    const batch = await Batch.findByIdAndDelete(req.params.id);
    if (!batch) return res.status(404).json({ message: 'Batch not found' });
    res.json({ message: `Batch ${batch.batchNumber} deleted` });
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
};

module.exports = { getAvailable, getSold, getOne, createBatch, updateBatch, markSold, deleteBatch };
