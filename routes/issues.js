const express = require('express');
const router = express.Router();

const Issue = require('../models/Issue');
const createController = require('../controllers/crudController');
const dbConnect = require('../db/connect'); // 🔥 REQUIRED

const ctrl = createController(Issue, ['requirement']);

/* ---------------- DB MIDDLEWARE ---------------- */
router.use(async (req, res, next) => {
  try {
    await dbConnect(); // ensures MongoDB is ready
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