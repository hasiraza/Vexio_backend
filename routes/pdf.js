const express = require('express');
const router = express.Router();
const multer = require('multer');
const path = require('path');
const fs = require('fs');
const { extractTextFromPDF, analyzeComplianceText } = require('../services/pdfService');
const Document = require('../models/Document');

// Ensure uploads directory exists
const uploadsDir = path.join(__dirname, '../uploads');
if (!fs.existsSync(uploadsDir)) fs.mkdirSync(uploadsDir, { recursive: true });

const storage = multer.diskStorage({
  destination: (req, file, cb) => cb(null, uploadsDir),
  filename: (req, file, cb) => {
    const unique = Date.now() + '-' + Math.round(Math.random() * 1e9);
    cb(null, unique + path.extname(file.originalname));
  }
});

const upload = multer({
  storage,
  limits: { fileSize: 50 * 1024 * 1024 },
  fileFilter: (req, file, cb) => {
    const allowed = ['.pdf', '.png', '.jpg', '.jpeg', '.tiff'];
    const ext = path.extname(file.originalname).toLowerCase();
    if (allowed.includes(ext)) cb(null, true);
    else cb(new Error('Only PDF and image files are allowed'));
  }
});

// Upload and analyze PDF
router.post('/upload', upload.single('pdf'), async (req, res) => {
  try {
    if (!req.file) return res.status(400).json({ error: 'No file uploaded' });

    const filePath = req.file.path;
    const { text, pages, method } = await extractTextFromPDF(filePath);
    
    if (!text || text.trim().length < 10) {
      return res.status(422).json({ error: 'Could not extract sufficient text from document' });
    }

    const analysis = analyzeComplianceText(text);

    // Save document record
    const doc = new Document({
      title: analysis.documentTitle || req.file.originalname,
      type: 'Evidence',
      status: 'Current',
      filePath: filePath,
      fileName: req.file.originalname,
      fileSize: req.file.size,
      mimeType: req.file.mimetype,
      extractedText: text.substring(0, 5000),
      source: 'PDF Upload',
      complianceScore: analysis.summary.complianceScore,
      notes: `Analyzed via ${method}. Pages: ${pages}`,
    });
    await doc.save();

    res.json({
      success: true,
      documentId: doc._id,
      fileName: req.file.originalname,
      pages,
      method,
      textLength: text.length,
      analysis,
      rawText: text.substring(0, 2000),
    });
  } catch (err) {
    console.error('PDF upload error:', err);
    res.status(500).json({ error: err.message });
  }
});

// Save extracted data to modules
router.post('/save-analysis', async (req, res) => {
  try {
    const { documentId, mappings } = req.body;
    const results = { created: [], errors: [] };

    const Requirement = require('../models/Requirement');
    const Issue = require('../models/Issue');
    const Risk = require('../models/Risk');

    if (mappings.requirements) {
      for (const req_data of mappings.requirements) {
        try {
          const code = `REQ-${Date.now()}-${Math.floor(Math.random() * 1000)}`;
          const item = new Requirement({ ...req_data, code, source: 'PDF Upload' });
          await item.save();
          results.created.push({ type: 'requirement', id: item._id, title: item.title });
        } catch (e) {
          results.errors.push({ type: 'requirement', error: e.message });
        }
      }
    }

    if (mappings.issues) {
      for (const issue_data of mappings.issues) {
        try {
          const code = `ISS-${Date.now()}-${Math.floor(Math.random() * 1000)}`;
          const item = new Issue({ ...issue_data, code, source: 'PDF Analysis' });
          await item.save();
          results.created.push({ type: 'issue', id: item._id, title: item.title });
        } catch (e) {
          results.errors.push({ type: 'issue', error: e.message });
        }
      }
    }

    res.json({ success: true, results });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;
