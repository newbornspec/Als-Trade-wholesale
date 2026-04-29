const jwt  = require('jsonwebtoken');
const User = require('../models/User');

// ── Helper: generate JWT ───────────────────────────────────────────────────
const generateToken = (id) =>
  jwt.sign({ id }, process.env.JWT_SECRET, {
    expiresIn: process.env.JWT_EXPIRES_IN || '30d',
  });

// ── POST /api/users/register ───────────────────────────────────────────────
const register = async (req, res) => {
  try {
    const { name, companyName, email, phone, country, password } = req.body;

    // Validate required fields
    if (!name || !companyName || !email || !phone || !password) {
      return res.status(400).json({ message: 'All required fields must be filled in' });
    }

    // Check if email already exists
    const existing = await User.findOne({ email: email.toLowerCase() });
    if (existing) {
      return res.status(409).json({ message: 'An account with this email already exists' });
    }

    // Create the user
    const user = await User.create({ name, companyName, email, phone, country, password });

    res.status(201).json({
      token:       generateToken(user._id),
      id:          user._id,
      name:        user.name,
      companyName: user.companyName,
      email:       user.email,
      role:        user.role,
    });
  } catch (err) {
    // Mongoose validation errors
    if (err.name === 'ValidationError') {
      const messages = Object.values(err.errors).map(e => e.message);
      return res.status(400).json({ message: messages.join('. ') });
    }
    res.status(500).json({ message: 'Server error during registration' });
  }
};

// ── POST /api/users/login ──────────────────────────────────────────────────
const login = async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ message: 'Email and password are required' });
    }

    // Explicitly select password (it's hidden by default in the schema)
    const user = await User.findOne({ email: email.toLowerCase() }).select('+password');

    if (!user || !(await user.matchPassword(password))) {
      return res.status(401).json({ message: 'Invalid email or password' });
    }

    if (!user.isApproved) {
      return res.status(403).json({ message: 'Your account is pending approval' });
    }

    res.json({
      token:       generateToken(user._id),
      id:          user._id,
      name:        user.name,
      companyName: user.companyName,
      email:       user.email,
      role:        user.role,
    });
  } catch (err) {
    res.status(500).json({ message: 'Server error during login' });
  }
};

// ── GET /api/users/me ──────────────────────────────────────────────────────
const getMe = async (req, res) => {
  try {
    res.json(req.user.toSafe());
  } catch (err) {
    res.status(500).json({ message: 'Could not fetch user profile' });
  }
};

// ── PATCH /api/users/me ────────────────────────────────────────────────────
const updateMe = async (req, res) => {
  try {
    const allowed = ['name', 'companyName', 'phone', 'country'];
    const updates = {};
    allowed.forEach(field => {
      if (req.body[field] !== undefined) updates[field] = req.body[field];
    });

    const user = await User.findByIdAndUpdate(req.user._id, updates, {
      new:              true,
      runValidators:    true,
    });

    res.json(user.toSafe());
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
};

module.exports = { register, login, getMe, updateMe };
