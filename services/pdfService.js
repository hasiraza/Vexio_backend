const fs = require('fs');
const path = require('path');

const extractTextFromPDF = async (filePath) => {
  try {
    const pdfParse = require('pdf-parse');
    const dataBuffer = fs.readFileSync(filePath);
    const data = await pdfParse(dataBuffer);
    return { text: data.text, pages: data.numpages, method: 'pdf-parse' };
  } catch (err) {
    console.error('pdf-parse failed, falling back to OCR:', err.message);
    return await extractWithOCR(filePath);
  }
};

const extractWithOCR = async (filePath) => {
  try {
    const Tesseract = require('tesseract.js');
    const { data: { text } } = await Tesseract.recognize(filePath, 'eng', {
      logger: m => console.log(m)
    });
    return { text, pages: 1, method: 'tesseract-ocr' };
  } catch (err) {
    throw new Error('Both PDF parsing and OCR failed: ' + err.message);
  }
};

const analyzeComplianceText = (text) => {
  const lines = text.split('\n').map(l => l.trim()).filter(Boolean);
  
  const findings = {
    requirements: [],
    statuses: [],
    risks: [],
    dates: [],
    evidence: [],
    summary: {},
  };

  // Date patterns
  const dateRegex = /\b(\d{1,2}[\/\-]\d{1,2}[\/\-]\d{2,4}|\d{4}[\/\-]\d{2}[\/\-]\d{2}|(?:Jan|Feb|Mar|Apr|May|Jun|Jul|Aug|Sep|Oct|Nov|Dec)[a-z]*\s+\d{1,2},?\s+\d{4})\b/gi;
  
  // Status patterns
  const statusKeywords = {
    compliant: /\b(compliant|completed|passed|approved|satisfactory|adequate|met|fulfilled)\b/gi,
    nonCompliant: /\b(non-compliant|non compliant|failed|not met|inadequate|violation|breach|deficiency|gap)\b/gi,
    warning: /\b(warning|partial|incomplete|pending|under review|in progress|attention required)\b/gi,
  };

  // Risk patterns
  const riskKeywords = /\b(high risk|medium risk|low risk|critical|severe|moderate|minor|risk level|risk rating)\b/gi;

  // Requirement patterns
  const reqKeywords = /\b(requirement|control|policy|procedure|standard|regulation|compliance|audit|review|assessment)\b/gi;

  // Evidence patterns
  const evidenceKeywords = /\b(evidence|documentation|record|log|report|certificate|proof|attestation)\b/gi;

  lines.forEach((line, idx) => {
    // Extract dates
    const dates = line.match(dateRegex);
    if (dates) findings.dates.push(...dates);

    // Detect statuses
    if (statusKeywords.compliant.test(line)) {
      statusKeywords.compliant.lastIndex = 0;
      findings.statuses.push({ line: idx + 1, text: line.substring(0, 200), status: 'Compliant' });
    }
    if (statusKeywords.nonCompliant.test(line)) {
      statusKeywords.nonCompliant.lastIndex = 0;
      findings.statuses.push({ line: idx + 1, text: line.substring(0, 200), status: 'Non-Compliant' });
    }
    if (statusKeywords.warning.test(line)) {
      statusKeywords.warning.lastIndex = 0;
      findings.statuses.push({ line: idx + 1, text: line.substring(0, 200), status: 'Warning' });
    }

    // Extract risk mentions
    if (riskKeywords.test(line)) {
      riskKeywords.lastIndex = 0;
      findings.risks.push({ line: idx + 1, text: line.substring(0, 200) });
    }

    // Extract requirement mentions
    if (reqKeywords.test(line)) {
      reqKeywords.lastIndex = 0;
      findings.requirements.push({ line: idx + 1, text: line.substring(0, 200) });
    }

    // Extract evidence mentions
    if (evidenceKeywords.test(line)) {
      evidenceKeywords.lastIndex = 0;
      findings.evidence.push({ line: idx + 1, text: line.substring(0, 200) });
    }
  });

  // Deduplicate dates
  findings.dates = [...new Set(findings.dates)];

  // Compute summary
  const compliantCount = findings.statuses.filter(s => s.status === 'Compliant').length;
  const nonCompliantCount = findings.statuses.filter(s => s.status === 'Non-Compliant').length;
  const warningCount = findings.statuses.filter(s => s.status === 'Warning').length;
  const total = compliantCount + nonCompliantCount + warningCount;

  let overallStatus = 'Pending';
  if (nonCompliantCount > 0) overallStatus = 'Non-Compliant';
  else if (warningCount > 0) overallStatus = 'Warning';
  else if (compliantCount > 0) overallStatus = 'Compliant';

  findings.summary = {
    overallStatus,
    compliantCount,
    nonCompliantCount,
    warningCount,
    totalStatusMentions: total,
    requirementsMentioned: findings.requirements.length,
    risksMentioned: findings.risks.length,
    evidenceMentioned: findings.evidence.length,
    datesFound: findings.dates.length,
    complianceScore: total > 0 ? Math.round((compliantCount / total) * 100) : 0,
  };

  // Generate suggestions
  findings.suggestions = generateSuggestions(findings);
  
  // Extract title from first lines
  findings.documentTitle = lines.slice(0, 5).find(l => l.length > 10 && l.length < 150) || 'Extracted Document';

  return findings;
};

const generateSuggestions = (findings) => {
  const suggestions = [];
  
  if (findings.summary.nonCompliantCount > 0) {
    suggestions.push({
      type: 'issue',
      severity: 'High',
      message: `${findings.summary.nonCompliantCount} non-compliant item(s) detected. Immediate action required.`,
    });
  }

  if (findings.summary.warningCount > 0) {
    suggestions.push({
      type: 'warning',
      severity: 'Medium',
      message: `${findings.summary.warningCount} warning(s) found. Review and address pending items.`,
    });
  }

  if (findings.evidence.length === 0) {
    suggestions.push({
      type: 'documentation',
      severity: 'Medium',
      message: 'No evidence documentation detected. Consider adding supporting documents.',
    });
  }

  if (findings.risks.length > 3) {
    suggestions.push({
      type: 'risk',
      severity: 'High',
      message: `${findings.risks.length} risk-related items detected. Conduct a formal risk assessment.`,
    });
  }

  if (findings.dates.length === 0) {
    suggestions.push({
      type: 'dates',
      severity: 'Low',
      message: 'No dates found in document. Ensure review and compliance dates are documented.',
    });
  }

  if (findings.summary.complianceScore >= 80) {
    suggestions.push({
      type: 'positive',
      severity: 'Low',
      message: `Good compliance score of ${findings.summary.complianceScore}%. Maintain current standards.`,
    });
  }

  return suggestions;
};

module.exports = { extractTextFromPDF, analyzeComplianceText };
