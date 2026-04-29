const mongoose = require('mongoose');

const riskSchema = new mongoose.Schema({
  code: { type: String, required: true, unique: true },
  title: { type: String, required: true },
  description: String,
  category: { type: String, enum: ['Operational', 'Compliance', 'Financial', 'Reputational', 'Strategic', 'Technology'], default: 'Operational' },
  likelihood: { type: Number, min: 1, max: 5, required: true },
  impact: { type: Number, min: 1, max: 5, required: true },
  riskRating: { type: Number },
  riskLevel: { type: String, enum: ['Critical', 'High', 'Medium', 'Low'] },
  status: { type: String, enum: ['Open', 'Mitigated', 'Accepted', 'Closed'], default: 'Open' },
  owner: String,
  mitigationPlan: String,
  residualRisk: Number,
  requirement: { type: mongoose.Schema.Types.ObjectId, ref: 'Requirement' },
  dueDate: Date,
  notes: String,
}, { timestamps: true });

riskSchema.pre('save', function(next) {
  this.riskRating = this.likelihood * this.impact;
  if (this.riskRating >= 20) this.riskLevel = 'Critical';
  else if (this.riskRating >= 12) this.riskLevel = 'High';
  else if (this.riskRating >= 6) this.riskLevel = 'Medium';
  else this.riskLevel = 'Low';
  next();
});

module.exports = mongoose.model('Risk', riskSchema);
