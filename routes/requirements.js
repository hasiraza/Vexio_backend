const express = require('express');
const router = express.Router();
const Requirement = require('../models/Requirement');
const createController = require('../controllers/crudController');

const ctrl = createController(Requirement, ['controls', 'documents']);
router.get('/', ctrl.getAll);
router.get('/:id', ctrl.getOne);
router.post('/', ctrl.create);
router.put('/:id', ctrl.update);
router.delete('/:id', ctrl.remove);

module.exports = router;
