const express = require('express');
const router = express.Router();

const Requirement = require('../models/Requirement');
const createController = require('../controllers/crudController');
const dbConnect = require('../db/connect'); // 🔥 IMPORTANT

const ctrl = createController(Requirement, ['controls', 'documents']);

/* ---------------- DB MIDDLEWARE ---------------- */
router.use(async (req, res, next) => {
  try {
    await dbConnect(); // 🔥 REQUIRED FOR VERCEL
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