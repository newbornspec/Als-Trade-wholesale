const jwt          = require('jsonwebtoken');
const nodemailer   = require('nodemailer');
const User         = require('../models/User');

// ── Helper: generate JWT ───────────────────────────────────────────────────
const generateToken = (id) =>
  jwt.sign({ id }, process.env.JWT_SECRET, {
    expiresIn: process.env.JWT_EXPIRES_IN || '30d',
  });

// ── Helper: generate 6-digit OTP ──────────────────────────────────────────
const generateOTP = () =>
  Math.floor(100000 + Math.random() * 900000).toString();

// ── Helper: send OTP email ────────────────────────────────────────────────
const sendOTPEmail = async (email, name, otp) => {
  const transporter = nodemailer.createTransport({
    host:   process.env.EMAIL_HOST || 'smtp.gmail.com',
    port:   parseInt(process.env.EMAIL_PORT) || 587,
    secure: parseInt(process.env.EMAIL_PORT) === 465,
    auth: {
      user: process.env.EMAIL_USER,
      pass: process.env.EMAIL_PASS,
    },
  });

  await transporter.sendMail({
    from:    process.env.EMAIL_FROM || process.env.EMAIL_USER,
    to:      email,
    subject: 'Your ALS Trade verification code',
    html: `
      <div style="font-family: sans-serif; max-width: 480px; margin: 0 auto;">
        <h2 style="color: #1a1a1a; margin-bottom: 8px;">Verify your email</h2>
        <p style="color: #555; font-size: 14px;">Hi ${name}, thanks for registering with ALS Trade.</p>
        <p style="color: #555; font-size: 14px;">Enter this code to complete your registration:</p>
        <div style="margin: 24px 0; text-align: center;">
          <div style="display: inline-block; background: #f5f5f5; border-radius: 10px; padding: 20px 40px;">
            <span style="font-size: 36px; font-weight: 800; letter-spacing: 10px; color: #1a1a1a; font-family: monospace;">${otp}</span>
          </div>
        </div>
        <p style="color: #888; font-size: 13px;">This code expires in <strong>15 minutes</strong>. Do not share it with anyone.</p>
        <p style="color: #888; font-size: 13px;">If you did not create an account, you can ignore this email.</p>
        <hr style="border: none; border-top: 1px solid #eee; margin: 24px 0;" />
        <p style="color: #aaa; font-size: 11px;">A.L.S Trade Ltd · Unit 11a Waterhall Farm, Hertford SG138LE</p>
      </div>
    `,
  });
};

// ── POST /api/users/register ───────────────────────────────────────────────
const register = async (req, res) => {
  try {
    const { name, companyName, email, phone, country, password } = req.body;

    if (!name || !companyName || !email || !phone || !password) {
      return res.status(400).json({ message: 'All required fields must be filled in' });
    }

    // Check if a verified account already exists with this email
    const existing = await User.findOne({ email: email.toLowerCase() });
    if (existing) {
      // If already verified — block re-registration
      if (existing.isEmailVerified) {
        return res.status(409).json({ message: 'An account with this email already exists' });
      }
      // If unverified (previous incomplete registration) — resend a fresh OTP
      const otp     = generateOTP();
      const expires = new Date(Date.now() + 15 * 60 * 1000); // 15 min
      existing.emailVerifyOTP        = otp;
      existing.emailVerifyOTPExpires = expires;
      // Update other fields in case they changed
      existing.name        = name;
      existing.companyName = companyName;
      existing.phone       = phone;
      existing.country     = country;
      existing.password    = password; // triggers pre-save hash
      await existing.save();
      await sendOTPEmail(email.toLowerCase(), name, otp);
      return res.status(200).json({
        message:         'A new verification code has been sent to your email.',
        pendingEmail:    email.toLowerCase(),
      });
    }

    // Generate OTP
    const otp     = generateOTP();
    const expires = new Date(Date.now() + 15 * 60 * 1000);

    // Create user — not yet verified
    await User.create({
      name, companyName, email, phone, country, password,
      isEmailVerified:      false,
      emailVerifyOTP:       otp,
      emailVerifyOTPExpires: expires,
    });

    // Send OTP email
    await sendOTPEmail(email.toLowerCase(), name, otp);

    res.status(201).json({
      message:      'Registration started. Check your email for the verification code.',
      pendingEmail: email.toLowerCase(),
    });
  } catch (err) {
    if (err.name === 'ValidationError') {
      const messages = Object.values(err.errors).map(e => e.message);
      return res.status(400).json({ message: messages.join('. ') });
    }
    console.error('Register error:', err.message);
    res.status(500).json({ message: 'Server error during registration' });
  }
};

// ── POST /api/users/verify-otp ────────────────────────────────────────────
const verifyOTP = async (req, res) => {
  try {
    const { email, otp } = req.body;
    if (!email || !otp) {
      return res.status(400).json({ message: 'Email and code are required' });
    }

    const user = await User
      .findOne({ email: email.toLowerCase() })
      .select('+emailVerifyOTP +emailVerifyOTPExpires');

    if (!user) {
      return res.status(404).json({ message: 'Account not found. Please register again.' });
    }
    if (user.isEmailVerified) {
      return res.status(400).json({ message: 'This email is already verified. Please log in.' });
    }
    if (!user.emailVerifyOTP || user.emailVerifyOTP !== otp.trim()) {
      return res.status(400).json({ message: 'Incorrect code. Please check your email and try again.' });
    }
    if (user.emailVerifyOTPExpires < new Date()) {
      return res.status(400).json({ message: 'This code has expired. Please request a new one.' });
    }

    // Mark verified and clear OTP fields
    user.isEmailVerified      = true;
    user.emailVerifyOTP       = undefined;
    user.emailVerifyOTPExpires = undefined;
    await user.save();

    res.json({
      token:       generateToken(user._id),
      id:          user._id,
      name:        user.name,
      companyName: user.companyName,
      email:       user.email,
      role:        user.role,
    });
  } catch (err) {
    console.error('Verify OTP error:', err.message);
    res.status(500).json({ message: 'Server error during verification' });
  }
};

// ── POST /api/users/resend-otp ────────────────────────────────────────────
const resendOTP = async (req, res) => {
  try {
    const { email } = req.body;
    if (!email) return res.status(400).json({ message: 'Email is required' });

    const user = await User
      .findOne({ email: email.toLowerCase() })
      .select('+emailVerifyOTP +emailVerifyOTPExpires');

    if (!user) {
      return res.status(404).json({ message: 'Account not found.' });
    }
    if (user.isEmailVerified) {
      return res.status(400).json({ message: 'This email is already verified.' });
    }

    const otp     = generateOTP();
    const expires = new Date(Date.now() + 15 * 60 * 1000);
    user.emailVerifyOTP        = otp;
    user.emailVerifyOTPExpires = expires;
    await user.save();

    await sendOTPEmail(email.toLowerCase(), user.name, otp);

    res.json({ message: 'A new verification code has been sent to your email.' });
  } catch (err) {
    console.error('Resend OTP error:', err.message);
    res.status(500).json({ message: 'Server error. Please try again.' });
  }
};

// ── POST /api/users/login ──────────────────────────────────────────────────
const login = async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ message: 'Email and password are required' });
    }

    const user = await User.findOne({ email: email.toLowerCase() }).select('+password');

    if (!user || !(await user.matchPassword(password))) {
      return res.status(401).json({ message: 'Invalid email or password' });
    }

    // Block login if email not verified
    if (!user.isEmailVerified) {
      return res.status(403).json({
        message:      'Please verify your email before logging in.',
        pendingEmail: user.email,
        needsVerification: true,
      });
    }

    if (!user.isApproved) {
      return res.status(403).json({ message: 'Your account is pending approval' });
    }

    user.lastLogin = new Date();
    await user.save();

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
      new:           true,
      runValidators: true,
    });

    res.json(user.toSafe());
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
};

module.exports = { register, login, getMe, updateMe, verifyOTP, resendOTP };
