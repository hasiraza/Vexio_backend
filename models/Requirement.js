const mongoose = require('mongoose');

const requirementSchema = new mongoose.Schema({
  code: { type: String, required: true, unique: true },
  title: { type: String, required: true },
  description: { type: String },
  category: { type: String, enum: ['Legal', 'Regulatory', 'Internal', 'Industry Standard'], default: 'Regulatory' },
  status: { type: String, enum: ['Compliant', 'Non-Compliant', 'Warning', 'Pending'], default: 'Pending' },
  priority: { type: String, enum: ['Critical', 'High', 'Medium', 'Low'], default: 'Medium' },
  dueDate: { type: Date },
  owner: { type: String },
  framework: { type: String, default: 'ISO 27001' },
  controls: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Control' }],
  documents: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Document' }],
  tags: [String],
  notes: String,
  lastReviewed: Date,
}, { timestamps: true });

module.exports = mongoose.model('Requirement', requirementSchema);
