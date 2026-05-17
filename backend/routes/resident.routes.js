const express = require('express');
const router = express.Router();
const residentController = require('../controllers/resident.controller');

router.post('/', residentController.createResident);
router.get('/', residentController.getResidents);
router.put('/:id', residentController.updateResident);
router.delete('/:id', residentController.deleteResident);

module.exports = router;
