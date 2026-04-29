const Batch   = require('../models/Batch');
const User    = require('../models/User');
const Enquiry = require('../models/Enquiry');

// ── GET /api/admin/stats ───────────────────────────────────────────────────
const getStats = async (req, res) => {
  try {
    const [
      totalBatches,
      availableBatches,
      soldBatches,
      totalUsers,
      unreadEnquiries,
    ] = await Promise.all([
      Batch.countDocuments(),
      Batch.countDocuments({ status: 'available' }),
      Batch.countDocuments({ status: 'sold' }),
      User.countDocuments({ role: 'customer' }),
      Enquiry.countDocuments({ isRead: false }),
    ]);

    res.json({
      totalBatches,
      availableBatches,
      soldBatches,
      totalUsers,
      unreadEnquiries,
    });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// ── GET /api/admin/enquiries ───────────────────────────────────────────────
const getEnquiries = async (req, res) => {
  try {
    const { unread } = req.query;
    const filter = unread === 'true' ? { isRead: false } : {};
    const enquiries = await Enquiry.find(filter)
      .populate('batchRef', 'batchNumber title')
      .sort('-createdAt');
    res.json(enquiries);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// ── PATCH /api/admin/enquiries/:id/read ───────────────────────────────────
const markEnquiryRead = async (req, res) => {
  try {
    const enquiry = await Enquiry.findByIdAndUpdate(
      req.params.id,
      { isRead: true },
      { new: true }
    );
    if (!enquiry) return res.status(404).json({ message: 'Enquiry not found' });
    res.json(enquiry);
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
};

// ── GET /api/admin/users ───────────────────────────────────────────────────
const getUsers = async (req, res) => {
  try {
    const users = await User.find({ role: 'customer' }).sort('-createdAt');
    res.json(users.map(u => u.toSafe()));
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

module.exports = { getStats, getEnquiries, markEnquiryRead, getUsers };
