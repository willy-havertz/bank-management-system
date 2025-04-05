const express = require('express');
const router = express.Router();
const { getOverview } = require('../controllers/userController');
const { authenticateToken } = require('../middleware/jwt');

router.get('/overview', authenticateToken, getOverview);

module.exports = router;
