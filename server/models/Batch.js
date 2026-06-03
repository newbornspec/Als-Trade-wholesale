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
    },
    quantity: {
      type:     Number,
      required: [true, 'Quantity is required'],
      min:      [1, 'Quantity must be at least 1'],
    },
    category: {
      type:     String,
      required: [true, 'Category is required'],
      enum:     ['laptops', 'computers', 'monitors', 'other'],
    },
    brand: {
      type: String,
      trim: true,
    },
    description: {
      type: String,
      trim: true,
    },
    specs: {
      type: String,
      trim: true,
    },

    // ── Condition ─────────────────────────────────────────────────────
    grade: {
      type:    String,
      enum:    ['A', 'B', 'C', 'mixed', null],
      default: null,
    },
    tested: {
      type:    Boolean,
      default: false,
    },
    hasList: {
      type:    Boolean,
      default: false,
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
      },
    ],

    // ── Product list file ─────────────────────────────────────────────
    productListFile: {
      type:    String,
      default: null,
    },
    productListFileName: {
      type:    String,
      default: null,
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
    timestamps: true,
  }
);

// ── Auto-generate slug from title before saving ────────────────────────────
batchSchema.pre('save', function (next) {
  if (this.isModified('title') || this.isNew) {
    this.slug = slugify(this.title, { lower: true, strict: true });
  }
  next();
});

// ── Strip price from response for guests ──────────────────────────────────
batchSchema.methods.toPublic = function () {
  const obj = this.toObject();
  delete obj.price;
  return obj;
};

module.exports = mongoose.model('Batch', batchSchema);
