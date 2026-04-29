const mongoose = require('mongoose');
const dotenv = require('dotenv');
dotenv.config();

const Requirement = require('./models/Requirement');
const Control = require('./models/Control');
const Risk = require('./models/Risk');
const Document = require('./models/Document');
const Review = require('./models/Review');
const Issue = require('./models/Issue');

const seed = async () => {
  await mongoose.connect(process.env.MONGODB_URI);
  console.log('Connected to MongoDB for seeding...');

  // Clear existing
  await Promise.all([
    Requirement.deleteMany({}),
    Control.deleteMany({}),
    Risk.deleteMany({}),
    Document.deleteMany({}),
    Review.deleteMany({}),
    Issue.deleteMany({}),
  ]);

  // Requirements
  const requirements = await Requirement.insertMany([
    { code: 'REQ-001', title: 'Data Protection Policy', description: 'Ensure personal data is handled per GDPR requirements', category: 'Regulatory', status: 'Compliant', priority: 'Critical', framework: 'GDPR', owner: 'DPO', dueDate: new Date('2025-12-31'), lastReviewed: new Date('2024-11-01') },
    { code: 'REQ-002', title: 'Access Control Management', description: 'Implement role-based access controls across all systems', category: 'Internal', status: 'Warning', priority: 'High', framework: 'ISO 27001', owner: 'IT Security', dueDate: new Date('2025-03-31') },
    { code: 'REQ-003', title: 'Incident Response Plan', description: 'Documented and tested incident response procedures', category: 'Regulatory', status: 'Non-Compliant', priority: 'Critical', framework: 'NIST', owner: 'CISO', dueDate: new Date('2024-12-31') },
    { code: 'REQ-004', title: 'Business Continuity Plan', description: 'Maintain and test BCP annually', category: 'Internal', status: 'Compliant', priority: 'High', framework: 'ISO 22301', owner: 'Risk Manager', dueDate: new Date('2025-06-30'), lastReviewed: new Date('2024-10-15') },
    { code: 'REQ-005', title: 'Vendor Risk Assessment', description: 'Third-party vendor risk assessments must be conducted annually', category: 'Industry Standard', status: 'Warning', priority: 'Medium', framework: 'SOC 2', owner: 'Procurement', dueDate: new Date('2025-04-30') },
    { code: 'REQ-006', title: 'Security Awareness Training', description: 'All staff must complete annual security awareness training', category: 'Internal', status: 'Compliant', priority: 'Medium', framework: 'ISO 27001', owner: 'HR', lastReviewed: new Date('2024-09-01') },
    { code: 'REQ-007', title: 'Vulnerability Management', description: 'Monthly vulnerability scans and quarterly penetration testing', category: 'Regulatory', status: 'Non-Compliant', priority: 'High', framework: 'PCI-DSS', owner: 'IT Security', dueDate: new Date('2025-01-31') },
    { code: 'REQ-008', title: 'Data Retention Policy', description: 'Define and enforce data retention schedules', category: 'Legal', status: 'Pending', priority: 'Medium', framework: 'GDPR', owner: 'Legal', dueDate: new Date('2025-05-31') },
  ]);

  // Controls
  const controls = await Control.insertMany([
    { code: 'CTL-001', title: 'Multi-Factor Authentication', description: 'MFA enforced on all privileged accounts', type: 'Preventive', status: 'Effective', frequency: 'Continuous', owner: 'IT', requirement: requirements[1]._id, effectiveness: 92, lastTested: new Date('2024-11-15') },
    { code: 'CTL-002', title: 'Access Log Monitoring', description: 'Daily review of access logs for anomalies', type: 'Detective', status: 'Partially Effective', frequency: 'Daily', owner: 'SOC', requirement: requirements[1]._id, effectiveness: 67, lastTested: new Date('2024-10-01') },
    { code: 'CTL-003', title: 'Data Encryption at Rest', description: 'AES-256 encryption for all stored personal data', type: 'Preventive', status: 'Effective', frequency: 'Continuous', owner: 'IT', requirement: requirements[0]._id, effectiveness: 98 },
    { code: 'CTL-004', title: 'Incident Response Drills', description: 'Quarterly tabletop exercises for IR team', type: 'Corrective', status: 'Ineffective', frequency: 'Quarterly', owner: 'CISO', requirement: requirements[2]._id, effectiveness: 30 },
    { code: 'CTL-005', title: 'Vulnerability Scanning', description: 'Automated weekly vulnerability scans', type: 'Detective', status: 'Not Tested', frequency: 'Weekly', owner: 'IT Security', requirement: requirements[6]._id, effectiveness: 0 },
    { code: 'CTL-006', title: 'Backup & Recovery Testing', description: 'Monthly backup restoration tests', type: 'Corrective', status: 'Effective', frequency: 'Monthly', owner: 'IT Ops', requirement: requirements[3]._id, effectiveness: 88, lastTested: new Date('2024-11-01') },
  ]);

  // Risks
  await Risk.insertMany([
    { code: 'RSK-001', title: 'Data Breach Risk', description: 'Risk of unauthorized access to personal data', category: 'Technology', likelihood: 3, impact: 5, status: 'Open', owner: 'CISO', requirement: requirements[0]._id, mitigationPlan: 'Implement DLP solutions and enhanced monitoring', dueDate: new Date('2025-03-31') },
    { code: 'RSK-002', title: 'Insider Threat', description: 'Malicious or negligent insider access to sensitive systems', category: 'Operational', likelihood: 2, impact: 4, status: 'Mitigated', owner: 'IT Security', requirement: requirements[1]._id, mitigationPlan: 'Enhanced UEBA monitoring deployed' },
    { code: 'RSK-003', title: 'Regulatory Non-Compliance', description: 'Failure to meet GDPR requirements resulting in fines', category: 'Compliance', likelihood: 3, impact: 5, status: 'Open', owner: 'DPO', requirement: requirements[0]._id, dueDate: new Date('2025-01-31') },
    { code: 'RSK-004', title: 'Third-Party Vulnerability', description: 'Security gaps introduced via vendor integrations', category: 'Technology', likelihood: 4, impact: 3, status: 'Open', owner: 'Procurement', requirement: requirements[4]._id, mitigationPlan: 'Annual vendor security assessments' },
    { code: 'RSK-005', title: 'System Downtime', description: 'Critical system unavailability affecting operations', category: 'Operational', likelihood: 2, impact: 4, status: 'Mitigated', owner: 'IT Ops', requirement: requirements[3]._id },
    { code: 'RSK-006', title: 'Phishing Attack', description: 'Staff susceptibility to social engineering attacks', category: 'Operational', likelihood: 4, impact: 3, status: 'Open', owner: 'HR', requirement: requirements[5]._id, dueDate: new Date('2025-02-28') },
  ]);

  // Documents
  await Document.insertMany([
    { title: 'GDPR Compliance Policy v2.1', type: 'Policy', status: 'Current', version: '2.1', owner: 'DPO', requirement: requirements[0]._id, expiryDate: new Date('2025-12-31'), source: 'Manual', complianceScore: 92 },
    { title: 'Access Control Procedure', type: 'Procedure', status: 'Under Review', version: '1.3', owner: 'IT Security', requirement: requirements[1]._id, source: 'Manual', complianceScore: 64 },
    { title: 'ISO 27001 Certification 2024', type: 'Certificate', status: 'Current', version: '1.0', owner: 'CISO', expiryDate: new Date('2025-10-01'), source: 'Manual', complianceScore: 100 },
    { title: 'Incident Response Runbook', type: 'Procedure', status: 'Outdated', version: '1.0', owner: 'CISO', requirement: requirements[2]._id, source: 'Manual', complianceScore: 35 },
    { title: 'BCP Test Results Q3 2024', type: 'Report', status: 'Current', version: '1.0', owner: 'Risk Manager', requirement: requirements[3]._id, source: 'Manual', complianceScore: 88 },
    { title: 'Vendor Risk Assessment Template', type: 'Policy', status: 'Current', version: '2.0', owner: 'Procurement', requirement: requirements[4]._id, source: 'Manual', complianceScore: 75 },
  ]);

  // Reviews
  await Review.insertMany([
    { title: 'Q4 2024 GDPR Compliance Review', type: 'Internal Audit', status: 'Completed', reviewer: 'Internal Audit Team', requirement: requirements[0]._id, scheduledDate: new Date('2024-10-01'), completedDate: new Date('2024-10-15'), findings: 'All data processing activities documented. DPIAs up to date.', score: 91, nextReviewDate: new Date('2025-04-01') },
    { title: 'Access Control Effectiveness Review', type: 'Periodic Review', status: 'Overdue', reviewer: 'IT Security Lead', requirement: requirements[1]._id, scheduledDate: new Date('2024-11-01'), nextReviewDate: new Date('2025-02-01') },
    { title: 'Incident Response Plan Audit', type: 'External Audit', status: 'In Progress', reviewer: 'EY Consulting', requirement: requirements[2]._id, scheduledDate: new Date('2024-12-01') },
    { title: 'Annual BCP Review 2024', type: 'Management Review', status: 'Completed', reviewer: 'Risk Committee', requirement: requirements[3]._id, scheduledDate: new Date('2024-09-15'), completedDate: new Date('2024-09-20'), score: 85, nextReviewDate: new Date('2025-09-15') },
    { title: 'Vendor Risk Review Q1 2025', type: 'Periodic Review', status: 'Scheduled', reviewer: 'Procurement Team', requirement: requirements[4]._id, scheduledDate: new Date('2025-01-15') },
    { title: 'Security Awareness Training Completion', type: 'Periodic Review', status: 'Completed', reviewer: 'HR Manager', requirement: requirements[5]._id, scheduledDate: new Date('2024-09-30'), completedDate: new Date('2024-10-05'), score: 96 },
  ]);

  // Issues
  await Issue.insertMany([
    { code: 'ISS-001', title: 'Incident Response Plan Not Updated', description: 'IRP has not been reviewed or updated since 2022, missing current threat landscape', severity: 'Critical', status: 'Open', category: 'Documentation', owner: 'CISO', requirement: requirements[2]._id, dueDate: new Date('2025-01-15'), rootCause: 'Resource constraints and competing priorities', actionPlan: 'Engage external consultant to update IRP by Q1 2025', source: 'Audit' },
    { code: 'ISS-002', title: 'Vulnerability Scans Not Performed', description: 'Monthly vulnerability scans missed for last 3 months', severity: 'High', status: 'In Progress', category: 'Control Failure', owner: 'IT Security', requirement: requirements[6]._id, dueDate: new Date('2025-01-31'), actionPlan: 'Deploy automated scanning tool', source: 'Review' },
    { code: 'ISS-003', title: 'MFA Not Enabled on All Admin Accounts', description: '3 service accounts still lack MFA enforcement', severity: 'High', status: 'In Progress', category: 'Compliance Gap', owner: 'IT', requirement: requirements[1]._id, dueDate: new Date('2025-01-10'), source: 'Manual' },
    { code: 'ISS-004', title: 'Vendor Risk Assessments Overdue', description: '5 vendors have not had risk assessments in over 18 months', severity: 'Medium', status: 'Open', category: 'Process Gap', owner: 'Procurement', requirement: requirements[4]._id, dueDate: new Date('2025-03-31'), source: 'Review' },
    { code: 'ISS-005', title: 'Access Review Not Completed', description: 'Quarterly access review Q3 2024 not completed', severity: 'Medium', status: 'Open', category: 'Process Gap', owner: 'IT Security', requirement: requirements[1]._id, dueDate: new Date('2025-02-01') },
    { code: 'ISS-006', title: 'Data Retention Schedule Missing', description: 'No documented data retention schedule for legacy systems', severity: 'Low', status: 'Open', category: 'Documentation', owner: 'Legal', requirement: requirements[7]._id, dueDate: new Date('2025-05-01'), source: 'Manual' },
  ]);

  console.log('✅ Seed data inserted successfully!');
  process.exit(0);
};

seed().catch(err => {
  console.error('Seeding failed:', err);
  process.exit(1);
});
