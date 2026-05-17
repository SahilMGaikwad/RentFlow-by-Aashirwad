const express = require('express');
const router = express.Router();
const paymentController = require('../controllers/payment.controller');

router.get('/', paymentController.getPayments);
router.put('/:id/paid', paymentController.markAsPaid);
router.post('/:id/remind', paymentController.sendReminder); // Bonus reminder route

module.exports = router;
