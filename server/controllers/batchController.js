const Batch = require('../models/Batch');

// ── GET /api/batches ───────────────────────────────────────────────────────
// Returns all available stock.
// Guests: price field stripped. Logged-in users: price included.
const getAvailable = async (req, res) => {
  try {
    const { category, brand, tested, search } = req.query;

    // Build dynamic filter
    const filter = { status: 'available' };
    if (category && category !== 'all') filter.category = category;
    if (brand)    filter.brand   = new RegExp(brand, 'i');
    if (tested)   filter.tested  = tested === 'true';
    if (search)   filter.title   = new RegExp(search, 'i');

    const batches = await Batch.find(filter).sort('-createdAt');

    // Hide price for non-authenticated users
    const result = batches.map(batch =>
      req.user ? batch.toObject() : batch.toPublic()
    );

    res.json(result);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// ── GET /api/batches/sold ──────────────────────────────────────────────────
const getSold = async (req, res) => {
  try {
    const batches = await Batch
      .find({ status: 'sold' })
      .sort('-soldAt')
      .select('-price'); // never expose price on sold stock

    res.json(batches);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// ── GET /api/batches/:slug ─────────────────────────────────────────────────
const getOne = async (req, res) => {
  try {
    const batch = await Batch.findOne({ slug: req.params.slug });

    if (!batch) {
      return res.status(404).json({ message: 'Batch not found' });
    }

    const result = req.user ? batch.toObject() : batch.toPublic();
    res.json(result);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// ── POST /api/batches — admin only ─────────────────────────────────────────
const createBatch = async (req, res) => {
  try {
    const {
      batchNumber, title, quantity, category, brand,
      description, specs, grade, tested, hasList, price, status, moq,
    } = req.body;

    // Separate images and PDF list file
    const images          = [];
    let   productListFile = null;

    if (req.files) {
      req.files.forEach(f => {
        if (f.mimetype === 'application/pdf') {
          productListFile = `/uploads/lists/${f.filename}`;
        } else {
          images.push(`/uploads/batches/${f.filename}`);
        }
      });
    }

    const batch = await Batch.create({
      batchNumber, title, quantity, category, brand,
      description, specs, grade,
      tested:  tested === 'true' || tested === true,
      hasList: hasList === 'true' || hasList === true,
      price, status, images,
      moq: moq ? Number(moq) : null,
      productListFile,
    });

    res.status(201).json(batch);
  } catch (err) {
    if (err.name === 'ValidationError') {
      const messages = Object.values(err.errors).map(e => e.message);
      return res.status(400).json({ message: messages.join('. ') });
    }
    if (err.code === 11000) {
      return res.status(409).json({ message: 'Batch number already exists' });
    }
    res.status(500).json({ message: err.message });
  }
};

// ── PUT /api/batches/:id — admin only ──────────────────────────────────────
const updateBatch = async (req, res) => {
  try {
    const updates = { ...req.body };
    if (updates.moq) updates.moq = Number(updates.moq);

    // Handle file uploads (images + PDF)
    if (req.files && req.files.length > 0) {
      const existing = await Batch.findById(req.params.id).select('images productListFile');
      const newImages = [];

      req.files.forEach(f => {
        if (f.mimetype === 'application/pdf') {
          updates.productListFile = `/uploads/lists/${f.filename}`;
        } else {
          newImages.push(`/uploads/batches/${f.filename}`);
        }
      });

      if (newImages.length > 0) {
        updates.images = [...(existing?.images || []), ...newImages];
      }
    }

    const batch = await Batch.findByIdAndUpdate(req.params.id, updates, {
      new:           true,
      runValidators: true,
    });

    if (!batch) return res.status(404).json({ message: 'Batch not found' });
    res.json(batch);
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
};

// ── PATCH /api/batches/:id/sold — admin only ───────────────────────────────
const markSold = async (req, res) => {
  try {
    const batch = await Batch.findByIdAndUpdate(
      req.params.id,
      { status: 'sold', soldAt: new Date() },
      { new: true }
    );
    if (!batch) return res.status(404).json({ message: 'Batch not found' });
    res.json({ message: 'Marked as sold', batch });
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
};

// ── DELETE /api/batches/:id — admin only ───────────────────────────────────
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
