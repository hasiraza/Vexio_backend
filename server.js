const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const dotenv = require('dotenv');
const path = require('path');

dotenv.config();

const app = express();

/* ---------------- SAFE CORS (PRODUCTION) ---------------- */
const allowedOrigins = [
  'http://localhost:3000',
  'https://vexio-frontend.vercel.app',
];

app.use(
  cors({
    origin: function (origin, callback) {
      if (!origin) return callback(null, true);

      if (allowedOrigins.includes(origin)) {
        return callback(null, true);
      }

      return callback(null, false);
    },
    credentials: true,
  })
);

/* ---------------- BODY PARSERS ---------------- */
app.use(express.json({ limit: '50mb' }));
app.use(express.urlencoded({ extended: true, limit: '50mb' }));

/* ---------------- STATIC FILES ---------------- */
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

/* ---------------- HEALTH ---------------- */
app.get('/api/health', (req, res) => {
  res.json({ status: 'OK', app: 'Vexio' });
});

/* ---------------- ROUTES ---------------- */
app.use('/api/requirements', require('./routes/requirements'));
app.use('/api/controls', require('./routes/controls'));
app.use('/api/risks', require('./routes/risks'));
app.use('/api/documents', require('./routes/documents'));
app.use('/api/reviews', require('./routes/reviews'));
app.use('/api/issues', require('./routes/issues'));
app.use('/api/pdf', require('./routes/pdf'));
app.use('/api/dashboard', require('./routes/dashboard'));

/* ---------------- MONGODB (FIXED FOR VERCEL) ---------------- */
const MONGODB_URI = process.env.MONGODB_URI;

if (!MONGODB_URI) {
  throw new Error('MONGODB_URI missing in env');
}

let cached = global.mongoose;

if (!cached) {
  cached = global.mongoose = { conn: null, promise: null };
}

async function connectDB() {
  if (cached.conn) return cached.conn;

  if (!cached.promise) {
    cached.promise = mongoose.connect(MONGODB_URI, {
      bufferCommands: false,
    });
  }

  cached.conn = await cached.promise;
  return cached.conn;
}

connectDB()
  .then(() => console.log('✅ MongoDB Connected'))
  .catch((err) => console.error('❌ Mongo Error', err));

/* ---------------- EXPORT (VERCEL) ---------------- */
module.exports = app;
