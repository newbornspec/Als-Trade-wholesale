const jwt        = require('jsonwebtoken');
const crypto     = require('crypto');
const nodemailer = require('nodemailer');
const User       = require('../models/User');

// ── Helper: generate JWT ───────────────────────────────────────────────────
const generateToken = (id) =>
  jwt.sign({ id }, process.env.JWT_SECRET, {
    expiresIn: process.env.JWT_EXPIRES_IN || '30d',
  });

// ── Helper: generate a cryptographically secure random token ──────────────
const generateVerifyToken = () => crypto.randomBytes(32).toString('hex');

// ── Helper: build nodemailer transporter ──────────────────────────────────
const createTransporter = () =>
  nodemailer.createTransport({
    host:   process.env.EMAIL_HOST || 'smtp.gmail.com',
    port:   parseInt(process.env.EMAIL_PORT) || 587,
    secure: parseInt(process.env.EMAIL_PORT) === 465,
    auth: {
      user: process.env.EMAIL_USER,
      pass: process.env.EMAIL_PASS,
    },
  });

// ── Helper: send verification link email ──────────────────────────────────
const sendVerificationEmail = async (email, name, token) => {
  const clientUrl  = process.env.CLIENT_URL || 'https://alswholesale.co.uk';
  const verifyLink = `${clientUrl}/verify-email?token=${token}`;

  const transporter = createTransporter();
  await transporter.sendMail({
    from:    process.env.EMAIL_FROM || process.env.EMAIL_USER,
    to:      email,
    subject: 'Verify your ALS Trade account',
    html: `
      <div style="font-family: sans-serif; max-width: 520px; margin: 0 auto; color: #333;">
        <h2 style="color: #1a1a1a; margin-bottom: 6px;">Verify your email address</h2>
        <p style="font-size: 14px; color: #555; line-height: 1.6;">
          Hi ${name}, thanks for registering with ALS Trade.<br/>
          Click the button below to verify your email and activate your account.
        </p>

        <div style="margin: 28px 0; text-align: center;">
          <a href="${verifyLink}"
             style="display: inline-block; background: #1a1a1a; color: #fff;
                    padding: 14px 32px; border-radius: 8px; font-size: 15px;
                    font-weight: 600; text-decoration: none; letter-spacing: 0.01em;">
            Activate my account →
          </a>
        </div>

        <p style="font-size: 13px; color: #888; line-height: 1.6;">
          This link is valid for <strong>24 hours</strong>. It can only be used once.<br/>
          If you did not create an account, you can safely ignore this email.
        </p>

        <p style="font-size: 12px; color: #bbb; margin-top: 8px;">
          If the button does not work, copy and paste this link into your browser:<br/>
          <a href="${verifyLink}" style="color: #888; word-break: break-all;">${verifyLink}</a>
        </p>

        <hr style="border: none; border-top: 1px solid #eee; margin: 24px 0;" />
        <p style="font-size: 11px; color: #bbb;">
          A.L.S Trade Ltd · Unit 11a Waterhall Farm, Hertford SG138LE · United Kingdom
        </p>
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

    const existing = await User.findOne({ email: email.toLowerCase() });
    if (existing) {
      return res.status(409).json({ message: 'An account with this email already exists' });
    }

    await User.create({
      name, companyName, email, phone, country, password,
      isEmailVerified: true, // no email verification required
    });

    res.status(201).json({ message: 'Account created successfully. You can now log in.' });
  } catch (err) {
    if (err.name === 'ValidationError') {
      const messages = Object.values(err.errors).map(e => e.message);
      return res.status(400).json({ message: messages.join('. ') });
    }
    console.error('Register error:', err.message);
    res.status(500).json({ message: 'Server error during registration' });
  }
};

// ── GET /api/users/verify-email?token=xxxx ────────────────────────────────
const verifyEmailToken = async (req, res) => {
  try {
    const { token } = req.query;
    if (!token) return res.status(400).json({ message: 'Verification token is missing.' });

    const user = await User
      .findOne({ emailVerifyToken: token })
      .select('+emailVerifyToken +emailVerifyTokenExpires');

    if (!user) {
      return res.status(400).json({
        message: 'This verification link is invalid or has already been used.',
      });
    }

    if (user.emailVerifyTokenExpires < new Date()) {
      return res.status(400).json({
        message: 'This verification link has expired. Please request a new one.',
        expired: true,
        email:   user.email,
      });
    }

    // Activate account — clear the token so the link cannot be reused
    user.isEmailVerified         = true;
    user.emailVerifyToken        = undefined;
    user.emailVerifyTokenExpires = undefined;
    user.lastLogin               = new Date();
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
    console.error('Verify token error:', err.message);
    res.status(500).json({ message: 'Server error during verification.' });
  }
};

// ── POST /api/users/resend-verification ───────────────────────────────────
const resendVerification = async (req, res) => {
  try {
    const { email } = req.body;
    if (!email) return res.status(400).json({ message: 'Email is required.' });

    const user = await User
      .findOne({ email: email.toLowerCase() })
      .select('+emailVerifyToken +emailVerifyTokenExpires');

    if (!user) {
      return res.status(404).json({ message: 'No account found with that email address.' });
    }
    if (user.isEmailVerified) {
      return res.status(400).json({ message: 'This account is already verified. Please log in.' });
    }

    const token   = generateVerifyToken();
    const expires = new Date(Date.now() + 24 * 60 * 60 * 1000);

    user.emailVerifyToken        = token;
    user.emailVerifyTokenExpires = expires;
    await user.save();

    await sendVerificationEmail(email.toLowerCase(), user.name, token);

    res.json({ message: 'A new verification link has been sent to your email.' });
  } catch (err) {
    console.error('Resend verification error:', err.message);
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

module.exports = { register, login, getMe, updateMe, verifyEmailToken, resendVerification };
