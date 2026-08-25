const jwt  = require('jsonwebtoken');
const User = require('../models/User');

// A JWT cannot be withdrawn once issued, so each one carries the account's
// tokenVersion at signing time and is rejected once that no longer matches.
// Bumping User.tokenVersion therefore invalidates every existing session for
// that account — the only revocation lever there is.
//
// Tokens signed before this existed have no `tv` claim. Those are treated as
// version 0, which is the default for every account, so live sessions are not
// logged out by the deploy that introduces this.
const tokenIsCurrent = (decoded, user) => (decoded.tv ?? 0) === (user.tokenVersion ?? 0);

// ── protect ────────────────────────────────────────────────────────────────
// Hard block: 401 if no valid token. Use on routes that REQUIRE login.
const protect = async (req, res, next) => {
  const auth = req.headers.authorization;

  if (!auth || !auth.startsWith('Bearer ')) {
    return res.status(401).json({ message: 'Not authorised — no token' });
  }

  try {
    const token   = auth.split(' ')[1];
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    req.user = await User.findById(decoded.id).select('-password');

    if (!req.user) {
      return res.status(401).json({ message: 'User no longer exists' });
    }
    if (!tokenIsCurrent(decoded, req.user)) {
      return res.status(401).json({ message: 'Session expired — please log in again' });
    }
    if (!req.user.isApproved) {
      return res.status(403).json({ message: 'Account pending approval' });
    }

    // Update last login timestamp
    req.user.lastLogin = new Date();
    await req.user.save({ validateBeforeSave: false });

    next();
  } catch (err) {
    return res.status(401).json({ message: 'Token invalid or expired' });
  }
};

// ── softAuth ───────────────────────────────────────────────────────────────
// Soft attach: if token is present and valid, sets req.user.
// If not, continues without req.user (used for price visibility logic).
const softAuth = async (req, res, next) => {
  const auth = req.headers.authorization;

  if (auth && auth.startsWith('Bearer ')) {
    try {
      const token   = auth.split(' ')[1];
      const decoded = jwt.verify(token, process.env.JWT_SECRET);
      const user    = await User.findById(decoded.id).select('-password');

      // Mirror the approval check protect enforces. Without it a de-approved
      // account still counted as logged in here, so it kept seeing trade
      // prices on the public reads even though every protected route had
      // started refusing it.
      req.user = user && user.isApproved && tokenIsCurrent(decoded, user) ? user : null;
    } catch {
      // Invalid token — just ignore, treat as guest
      req.user = null;
    }
  }

  next();
};

// ── admin ──────────────────────────────────────────────────────────────────
// Must be used AFTER protect middleware in the chain.
const admin = (req, res, next) => {
  if (req.user && req.user.role === 'admin') {
    return next();
  }
  res.status(403).json({ message: 'Admin access required' });
};

module.exports = { protect, softAuth, admin };
