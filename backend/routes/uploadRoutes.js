const express = require('express');
const router = express.Router();
const { uploadProfilePicture , getUserProfile} = require('../controllers/uploadController');
const { authenticateToken } = require('../middleware/jwt');
const uploadMiddleware = require('../middleware/uploadMiddleware');


router.post('/upload-profile', authenticateToken, uploadMiddleware, uploadProfilePicture);
router.get('/profile', authenticateToken, getUserProfile);

module.exports = router;
