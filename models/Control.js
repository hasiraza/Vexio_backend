const mongoose = require('mongoose');

const controlSchema = new mongoose.Schema({
  code: { type: String, required: true, unique: true },
  title: { type: String, required: true },
  description: String,
  type: { type: String, enum: ['Preventive', 'Detective', 'Corrective', 'Directive'], default: 'Preventive' },
  status: { type: String, enum: ['Effective', 'Partially Effective', 'Ineffective', 'Not Tested'], default: 'Not Tested' },
  frequency: { type: String, enum: ['Continuous', 'Daily', 'Weekly', 'Monthly', 'Quarterly', 'Annual'], default: 'Monthly' },
  owner: String,
  requirement: { type: mongoose.Schema.Types.ObjectId, ref: 'Requirement' },
  lastTested: Date,
  nextTestDate: Date,
  evidence: String,
  notes: String,
  effectiveness: { type: Number, min: 0, max: 100, default: 0 },
}, { timestamps: true });

module.exports = mongoose.model('Control', controlSchema);
