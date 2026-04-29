const mongoose = require('mongoose');

const documentSchema = new mongoose.Schema({
  title: { type: String, required: true },
  type: { type: String, enum: ['Policy', 'Procedure', 'Evidence', 'Report', 'Certificate', 'Contract', 'Other'], default: 'Policy' },
  status: { type: String, enum: ['Current', 'Outdated', 'Under Review', 'Archived'], default: 'Current' },
  version: { type: String, default: '1.0' },
  owner: String,
  filePath: String,
  fileName: String,
  fileSize: Number,
  mimeType: String,
  extractedText: String,
  requirement: { type: mongoose.Schema.Types.ObjectId, ref: 'Requirement' },
  expiryDate: Date,
  reviewDate: Date,
  tags: [String],
  notes: String,
  source: { type: String, enum: ['Manual', 'PDF Upload'], default: 'Manual' },
  complianceScore: { type: Number, min: 0, max: 100 },
}, { timestamps: true });

module.exports = mongoose.model('Document', documentSchema);
