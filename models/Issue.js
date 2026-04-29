const mongoose = require('mongoose');

const issueSchema = new mongoose.Schema({
  code: { type: String, required: true, unique: true },
  title: { type: String, required: true },
  description: String,
  severity: { type: String, enum: ['Critical', 'High', 'Medium', 'Low'], default: 'Medium' },
  status: { type: String, enum: ['Open', 'In Progress', 'Resolved', 'Closed', 'Deferred'], default: 'Open' },
  category: { type: String, enum: ['Compliance Gap', 'Control Failure', 'Policy Violation', 'Process Gap', 'Documentation', 'Other'], default: 'Compliance Gap' },
  owner: String,
  requirement: { type: mongoose.Schema.Types.ObjectId, ref: 'Requirement' },
  dueDate: Date,
  resolvedDate: Date,
  rootCause: String,
  actionPlan: String,
  notes: String,
  source: { type: String, enum: ['Manual', 'PDF Analysis', 'Audit', 'Review'], default: 'Manual' },
}, { timestamps: true });

module.exports = mongoose.model('Issue', issueSchema);
