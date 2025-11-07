const express = require('express');
const { submitTransaction, getTransactions, getAllTransactions } = require('../controllers/transactionController');
const { validatePayment } = require('../middleware/validatePayment');
const router = express.Router();

router.post('/', validatePayment, submitTransaction);
router.get('/', getTransactions);

router.get('/all', getAllTransactions);

console.log('validatePayment is:', typeof validatePayment);

module.exports = router;
