const mongoose = require('mongoose');

const reviewSchema = new mongoose.Schema({
  title: { type: String, required: true },
  type: { type: String, enum: ['Internal Audit', 'External Audit', 'Management Review', 'Periodic Review', 'Ad-hoc'], default: 'Periodic Review' },
  status: { type: String, enum: ['Scheduled', 'In Progress', 'Completed', 'Overdue', 'Cancelled'], default: 'Scheduled' },
  reviewer: String,
  requirement: { type: mongoose.Schema.Types.ObjectId, ref: 'Requirement' },
  scheduledDate: Date,
  completedDate: Date,
  findings: String,
  recommendations: String,
  score: { type: Number, min: 0, max: 100 },
  nextReviewDate: Date,
  notes: String,
}, { timestamps: true });

module.exports = mongoose.model('Review', reviewSchema);
