const mongoose = require('mongoose');

const enquirySchema = new mongoose.Schema(
  {
    name:        { type: String, required: true, trim: true },
    companyName: { type: String, trim: true },
    phone:       { type: String, required: true, trim: true },
    email:       { type: String, required: true, lowercase: true, trim: true },
    message:     { type: String, required: true, trim: true },

    // Optional: link enquiry to a specific batch
    batchRef:    { type: mongoose.Schema.Types.ObjectId, ref: 'Batch', default: null },

    // Admin tracking
    isRead:      { type: Boolean, default: false },
    repliedAt:   { type: Date },
  },
  {
    timestamps: true,
  }
);

module.exports = mongoose.model('Enquiry', enquirySchema);
