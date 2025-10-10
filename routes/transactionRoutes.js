const express = require('express');
const { submitTransaction, getTransactions } = require('../controllers/transactionController');
const { validatePayment } = require('../middleware/validatePayment');
const router = express.Router();

router.post('/', validatePayment, submitTransaction);
router.get('/', getTransactions);
console.log('validateInput is:', typeof validateInput);

module.exports = router;