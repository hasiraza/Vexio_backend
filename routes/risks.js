const express = require('express');
const router = express.Router();

const Risk = require('../models/Risk');
const createController = require('../controllers/crudController');
const dbConnect = require('../db/connect'); // 🔥 IMPORTANT

const ctrl = createController(Risk, ['requirement']);

/* ---------------- DB MIDDLEWARE ---------------- */
router.use(async (req, res, next) => {
  try {
    await dbConnect(); // 🔥 REQUIRED for Vercel serverless
    next();
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

/* ---------------- ROUTES ---------------- */
router.get('/', ctrl.getAll);
router.get('/:id', ctrl.getOne);
router.post('/', ctrl.create);
router.put('/:id', ctrl.update);
router.delete('/:id', ctrl.remove);

module.exports = router;