const express = require('express');
const router = express.Router();
const { getNotifications,getEmployeeNotifications  } = require('../controllers/notificationController');
const { authenticateToken } = require('../middleware/jwt');

// Define a route that returns notifications for the logged-in user
router.get('/', authenticateToken, getNotifications);
router.get('/employee', authenticateToken, getEmployeeNotifications);


module.exports = router;
