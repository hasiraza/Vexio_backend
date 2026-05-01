const express = require('express');
const cors = require('cors');
const dotenv = require('dotenv');
const path = require('path');

dotenv.config();

const app = express();

/* ---------------- ENV ---------------- */
const FRONTEND_URL =
  process.env.FRONTEND_URL || 'http://localhost:3000';

/* ---------------- ALLOWED ORIGINS ---------------- */
const allowedOrigins = [
  'http://localhost:3000',
  'http://localhost:5000',
  FRONTEND_URL,
  'https://vexio-frontend.vercel.app',
  'https://vexio-frontend-git-main-hasirazas-projects.vercel.app',
];

/* ---------------- MIDDLEWARE ---------------- */
app.use(
  cors({
    origin: function (origin, callback) {
      // Allow requests with no origin (mobile apps, curl, Postman)
      if (!origin) return callback(null, true);

      // Allow any Vercel preview URL for your project
      const isVercelPreview = /https:\/\/vexio-frontend.*\.vercel\.app$/.test(origin);

      if (allowedOrigins.includes(origin) || isVercelPreview) {
        callback(null, true);
      } else {
        console.warn(`CORS blocked: ${origin}`);
        callback(new Error(`CORS policy: origin ${origin} not allowed`));
      }
    },
    credentials: true,
  })
);

app.use(express.json({ limit: '50mb' }));
app.use(express.urlencoded({ extended: true, limit: '50mb' }));

/* ---------------- STATIC ---------------- */
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

/* ---------------- ROOT ---------------- */
app.get('/', (req, res) => {
  res.json({ message: 'Vexio Backend API Running' });
});

/* ---------------- 🔥 DB MIDDLEWARE (IMPORTANT FIX) ---------------- */
const dbMiddleware = require('./middleware/dbConnect');
app.use('/api', dbMiddleware);

/* ---------------- ROUTES ---------------- */
app.use('/api/requirements', require('./routes/requirements'));
app.use('/api/controls', require('./routes/controls'));
app.use('/api/risks', require('./routes/risks'));
app.use('/api/documents', require('./routes/documents'));
app.use('/api/reviews', require('./routes/reviews'));
app.use('/api/issues', require('./routes/issues'));
app.use('/api/pdf', require('./routes/pdf'));
app.use('/api/dashboard', require('./routes/dashboard'));

/* ---------------- HEALTH ---------------- */
app.get('/api/health', (req, res) => {
  res.json({ status: 'OK', app: 'Vexio' });
});

/* ---------------- EXPORT ---------------- */
module.exports = app;
