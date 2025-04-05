const express = require('express');
const router = express.Router();
const { deposit, withdraw, sendMoney, getTransactions,getAllTransactions } = require('../controllers/transactionController');
const { authenticateToken } = require('../middleware/jwt');

router.post('/deposit', authenticateToken, deposit);
router.post('/withdraw', authenticateToken, withdraw);
router.post('/send', authenticateToken, sendMoney);
router.get('/transactions', authenticateToken, getTransactions);
router.get('/all', authenticateToken, getAllTransactions);

module.exports = router;
