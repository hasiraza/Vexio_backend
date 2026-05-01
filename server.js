const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const dotenv = require('dotenv');
const path = require('path');

dotenv.config();

const app = express();

// Environment Variables
const FRONTEND_URL =
  process.env.FRONTEND_URL ||
  'http://localhost:3000';

// Middleware
app.use(
  cors({
    origin: FRONTEND_URL,
    credentials: true,
  })
);

app.use(express.json({ limit: '50mb' }));

app.use(
  express.urlencoded({
    extended: true,
    limit: '50mb',
  })
);

// Static Uploads
app.use(
  '/uploads',
  express.static(path.join(__dirname, 'uploads'))
);

// ROOT ROUTE
app.get('/', (req, res) => {
  res.json({
    message: 'Vexio Backend API Running',
  });
});

// Routes
app.use(
  '/api/requirements',
  require('./routes/requirements')
);

app.use(
  '/api/controls',
  require('./routes/controls')
);

app.use(
  '/api/risks',
  require('./routes/risks')
);

app.use(
  '/api/documents',
  require('./routes/documents')
);

app.use(
  '/api/reviews',
  require('./routes/reviews')
);

app.use(
  '/api/issues',
  require('./routes/issues')
);

app.use(
  '/api/pdf',
  require('./routes/pdf')
);

app.use(
  '/api/dashboard',
  require('./routes/dashboard')
);

// Health Check
app.get('/api/health', (req, res) => {
  res.json({
    status: 'OK',
    app: 'Vexio',
  });
});

// MongoDB Connection
mongoose
  .connect(process.env.MONGODB_URI)
  .then(() => {
    console.log('✅ Connected to MongoDB');
  })
  .catch((err) => {
    console.error(
      '❌ MongoDB connection error:',
      err
    );
  });

// IMPORTANT FOR VERCEL
module.exports = app;
