const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const dotenv = require('dotenv');
const path = require('path');

dotenv.config();

const app = express();

// Middleware
app.use(cors());
app.use(express.json({ limit: '50mb' }));
app.use(express.urlencoded({ extended: true, limit: '50mb' }));
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// Serve the self-contained frontend
app.use(express.static(path.join(__dirname, '../frontend/public')));

// Routes
app.use('/api/requirements', require('./routes/requirements'));
app.use('/api/controls', require('./routes/controls'));
app.use('/api/risks', require('./routes/risks'));
app.use('/api/documents', require('./routes/documents'));
app.use('/api/reviews', require('./routes/reviews'));
app.use('/api/issues', require('./routes/issues'));
app.use('/api/pdf', require('./routes/pdf'));
app.use('/api/dashboard', require('./routes/dashboard'));

// Health check
app.get('/api/health', (req, res) => res.json({ status: 'OK', app: 'Vexio' }));

// SPA fallback
app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, '../frontend/public/index.html'));
});

// Connect to MongoDB
mongoose.connect(process.env.MONGODB_URI)
  .then(() => {
    console.log('✅ Connected to MongoDB');
    app.listen(process.env.PORT || 5000, () => {
      console.log(`🚀 Vexio API running on port ${process.env.PORT || 5000}`);
    });
  })
  .catch(err => {
    console.error('❌ MongoDB connection error:', err);
    process.exit(1);
  });

module.exports = app;
