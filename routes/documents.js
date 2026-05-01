const express = require('express');
const router = express.Router();

const Document = require('../models/Document');
const createController = require('../controllers/crudController');
const dbConnect = require('../db/connect'); // 🔥 IMPORTANT

const ctrl = createController(Document, ['requirement']);

/* ------------------ MIDDLEWARE FIX ------------------ */
/* Ensures MongoDB is connected before every request */

router.use(async (req, res, next) => {
  try {
    await dbConnect(); // 🔥 CRITICAL FOR VERCEL
    next();
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

/* ------------------ ROUTES ------------------ */
router.get('/', ctrl.getAll);
router.get('/:id', ctrl.getOne);
router.post('/', ctrl.create);
router.put('/:id', ctrl.update);
router.delete('/:id', ctrl.remove);

module.exports = router;