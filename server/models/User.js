const mongoose = require('mongoose');
const bcrypt   = require('bcryptjs');

const userSchema = new mongoose.Schema(
  {
    // ── Personal info ─────────────────────────────────────────────────
    name: {
      type:     String,
      required: [true, 'Name is required'],
      trim:     true,
    },

    // ── B2B fields — company required, no private individuals ─────────
    companyName: {
      type:     String,
      required: [true, 'Company name is required'],
      trim:     true,
    },
    country: {
      type: String,
      trim: true,
    },

    // ── Contact ────────────────────────────────────────────────────────
    email: {
      type:      String,
      required:  [true, 'Email is required'],
      unique:    true,
      lowercase: true,
      trim:      true,
      match:     [/^\S+@\S+\.\S+$/, 'Please enter a valid email'],
    },
    phone: {
      type:     String,
      required: [true, 'Phone number is required'],
      trim:     true,
    },

    // ── Auth ───────────────────────────────────────────────────────────
    password: {
      type:     String,
      required: [true, 'Password is required'],
      minlength: [8, 'Password must be at least 8 characters'],
      select:   false, // never returned in queries by default
    },
    role: {
      type:    String,
      enum:    ['customer', 'admin'],
      default: 'customer',
    },

    // ── Account state ─────────────────────────────────────────────────
    isApproved: {
      type:    Boolean,
      default: true,
      // set to false if you want manual approval before seeing prices
    },
    lastLogin: {
      type: Date,
    },
  },
  {
    timestamps: true,
  }
);

// ── Hash password before saving ────────────────────────────────────────────
userSchema.pre('save', async function (next) {
  if (!this.isModified('password')) return next();
  const salt = await bcrypt.genSalt(12);
  this.password = await bcrypt.hash(this.password, salt);
  next();
});

// ── Instance method: compare entered password with stored hash ────────────
userSchema.methods.matchPassword = async function (enteredPassword) {
  return bcrypt.compare(enteredPassword, this.password);
};

// ── Safe user object (strip sensitive fields for responses) ───────────────
userSchema.methods.toSafe = function () {
  const obj = this.toObject();
  delete obj.password;
  delete obj.__v;
  return obj;
};

module.exports = mongoose.model('User', userSchema);
