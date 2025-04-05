// In your routes file, e.g., customerRoutes.js
const express = require('express');
const router = express.Router();
const { getCustomerAccounts } = require('../controllers/customerController');
const { authenticateToken } = require('../middleware/jwt');

// Define the endpoint to retrieve customer accounts
router.get('/accounts', authenticateToken, getCustomerAccounts);

module.exports = router;
