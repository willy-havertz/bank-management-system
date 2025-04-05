// dashboardDataRoutes.js
const express = require('express');
const router = express.Router();
const { getCreditData, getMonthlySpending, getEmployeeCreditData } = require('../controllers/dashboardDataController');
const { authenticateToken } = require('../middleware/jwt');

router.get('/credit-data', authenticateToken, getCreditData);
router.get('/monthly-spending', authenticateToken, getMonthlySpending);
router.get('/employee-credit-data', authenticateToken, getEmployeeCreditData);

module.exports = router;
