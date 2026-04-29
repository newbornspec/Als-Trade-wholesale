const mongoose = require('mongoose');
const slugify  = require('slugify');

const batchSchema = new mongoose.Schema(
  {
    // ── Identity ──────────────────────────────────────────────────────
    batchNumber: {
      type:     String,
      required: [true, 'Batch number is required'],
      unique:   true,
      trim:     true,
      // e.g. RT3426
    },
    slug: {
      type:   String,
      unique: true,
    },

    // ── Product info ──────────────────────────────────────────────────
    title: {
      type:     String,
      required: [true, 'Title is required'],
      trim:     true,
      // e.g. "49x Apple iPhone & iPads Mix"
    },
    quantity: {
      type:     Number,
      required: [true, 'Quantity is required'],
      min:      [1, 'Quantity must be at least 1'],
    },
    category: {
      type:     String,
      required: [true, 'Category is required'],
      enum:     ['laptops', 'phones', 'tablets', 'mixed', 'other'],
    },
    brand: {
      type: String,
      trim: true,
      // e.g. Apple, Samsung, HP, Mixed
    },
    description: {
      type: String,
      trim: true,
    },
    specs: {
      type: String,
      trim: true,
      // e.g. "Intel Core i7 8th Gen - 8GB RAM - 256GB SSD"
    },

    // ── Condition ─────────────────────────────────────────────────────
    grade: {
      type: String,
      enum: ['A', 'B', 'C', 'mixed', null],
      default: null,
    },
    tested: {
      type:    Boolean,
      default: false,
    },
    hasList: {
      type:    Boolean,
      default: false,
      // false = "NO List!" — no per-unit breakdown available
    },

    // ── Pricing (hidden from guests) ──────────────────────────────────
    price: {
      type: Number,
      min:  [0, 'Price cannot be negative'],
    },
    currency: {
      type:    String,
      default: 'GBP',
    },

    // ── Images ────────────────────────────────────────────────────────
    images: [
      {
        type: String,
        // stored as URL path e.g. /uploads/batches/RT3426-1.jpg
      },
    ],

    // ── Product list file (PDF) ───────────────────────────────────────
    productListFile: {
      type: String,
      // stored as URL path e.g. /uploads/lists/RT3426-list.pdf
    },

    // ── Minimum Order Quantity ────────────────────────────────────────
    moq: {
      type:    Number,
      min:     [1, 'MOQ must be at least 1'],
      default: null,
    },

    // ── Status ────────────────────────────────────────────────────────
    status: {
      type:    String,
      enum:    ['available', 'sold'],
      default: 'available',
    },
    soldAt: {
      type: Date,
    },
  },
  {
    timestamps: true, // adds createdAt + updatedAt automatically
  }
);

// ── Auto-generate slug from title before saving ────────────────────────────
batchSchema.pre('save', function (next) {
  if (this.isModified('title') || this.isNew) {
    this.slug = slugify(this.title, { lower: true, strict: true });
  }
  next();
});

// ── Strip price from response for guests (called in controller) ───────────
batchSchema.methods.toPublic = function () {
  const obj = this.toObject();
  delete obj.price;
  return obj;
};

module.exports = mongoose.model('Batch', batchSchema);
