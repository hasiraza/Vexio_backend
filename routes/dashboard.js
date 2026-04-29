const express = require('express');
const router = express.Router();
const Requirement = require('../models/Requirement');
const Control = require('../models/Control');
const Risk = require('../models/Risk');
const Document = require('../models/Document');
const Review = require('../models/Review');
const Issue = require('../models/Issue');

router.get('/stats', async (req, res) => {
  try {
    const now = new Date();

    const [
      totalRequirements,
      compliantReqs,
      nonCompliantReqs,
      warningReqs,
      pendingReqs,
      totalControls,
      effectiveControls,
      totalRisks,
      highRisks,
      criticalRisks,
      openIssues,
      inProgressIssues,
      totalDocs,
      overdueReviews,
      completedReviews,
      totalReviews,
    ] = await Promise.all([
      Requirement.countDocuments(),
      Requirement.countDocuments({ status: 'Compliant' }),
      Requirement.countDocuments({ status: 'Non-Compliant' }),
      Requirement.countDocuments({ status: 'Warning' }),
      Requirement.countDocuments({ status: 'Pending' }),
      Control.countDocuments(),
      Control.countDocuments({ status: 'Effective' }),
      Risk.countDocuments(),
      Risk.countDocuments({ riskLevel: 'High' }),
      Risk.countDocuments({ riskLevel: 'Critical' }),
      Issue.countDocuments({ status: 'Open' }),
      Issue.countDocuments({ status: 'In Progress' }),
      Document.countDocuments(),
      Review.countDocuments({ status: { $ne: 'Completed' }, scheduledDate: { $lt: now } }),
      Review.countDocuments({ status: 'Completed' }),
      Review.countDocuments(),
    ]);

    // Risk distribution
    const riskDistribution = await Risk.aggregate([
      { $group: { _id: '$riskLevel', count: { $sum: 1 } } }
    ]);

    // Issue status distribution
    const issueStatusDist = await Issue.aggregate([
      { $group: { _id: '$status', count: { $sum: 1 } } }
    ]);

    // Requirements by category
    const reqByCategory = await Requirement.aggregate([
      { $group: { _id: '$category', count: { $sum: 1 } } }
    ]);

    // Monthly requirements trend (last 6 months)
    const sixMonthsAgo = new Date();
    sixMonthsAgo.setMonth(sixMonthsAgo.getMonth() - 6);
    const monthlyTrend = await Requirement.aggregate([
      { $match: { createdAt: { $gte: sixMonthsAgo } } },
      { $group: {
        _id: { month: { $month: '$createdAt' }, year: { $year: '$createdAt' } },
        count: { $sum: 1 }
      }},
      { $sort: { '_id.year': 1, '_id.month': 1 } }
    ]);

    // Recent issues
    const recentIssues = await Issue.find()
      .populate('requirement', 'title code')
      .sort({ createdAt: -1 })
      .limit(5);

    // Overdue reviews
    const overdueReviewsList = await Review.find({ 
      status: { $ne: 'Completed' },
      scheduledDate: { $lt: now }
    }).populate('requirement', 'title').limit(5);

    // Compliance score
    const complianceScore = totalRequirements > 0 
      ? Math.round((compliantReqs / totalRequirements) * 100) 
      : 0;

    const controlEffectiveness = totalControls > 0
      ? Math.round((effectiveControls / totalControls) * 100)
      : 0;

    const reviewCompletion = totalReviews > 0
      ? Math.round((completedReviews / totalReviews) * 100)
      : 0;

    res.json({
      summary: {
        totalRequirements,
        compliantReqs,
        nonCompliantReqs,
        warningReqs,
        pendingReqs,
        totalControls,
        effectiveControls,
        totalRisks,
        highRisks,
        criticalRisks,
        openIssues,
        inProgressIssues,
        totalDocs,
        overdueReviews,
        completedReviews,
        totalReviews,
        complianceScore,
        controlEffectiveness,
        reviewCompletion,
      },
      charts: {
        riskDistribution,
        issueStatusDist,
        reqByCategory,
        monthlyTrend,
      },
      recentIssues,
      overdueReviews: overdueReviewsList,
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Compliance table data
router.get('/compliance-table', async (req, res) => {
  try {
    const requirements = await Requirement.find()
      .populate('controls')
      .sort({ priority: -1, status: 1 })
      .limit(50);

    const table = await Promise.all(requirements.map(async (req) => {
      const issues = await Issue.countDocuments({ requirement: req._id, status: { $in: ['Open', 'In Progress'] } });
      const risks = await Risk.find({ requirement: req._id }).sort({ riskRating: -1 }).limit(1);
      const topRisk = risks[0];

      let recommendation = '';
      if (req.status === 'Non-Compliant') recommendation = 'Immediate remediation required';
      else if (req.status === 'Warning') recommendation = 'Review and update controls';
      else if (issues > 0) recommendation = `Resolve ${issues} open issue(s)`;
      else if (req.status === 'Compliant') recommendation = 'Maintain current controls';
      else recommendation = 'Complete compliance assessment';

      return {
        _id: req._id,
        code: req.code,
        title: req.title,
        category: req.category,
        status: req.status,
        priority: req.priority,
        riskLevel: topRisk?.riskLevel || 'Low',
        riskRating: topRisk?.riskRating || 0,
        openIssues: issues,
        controlsCount: req.controls?.length || 0,
        dueDate: req.dueDate,
        lastReviewed: req.lastReviewed,
        recommendation,
      };
    }));

    res.json(table);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;
