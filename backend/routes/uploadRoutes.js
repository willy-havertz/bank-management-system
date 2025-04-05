const express = require('express');
const router = express.Router();
const { uploadProfilePicture , getUserProfile} = require('../controllers/uploadController');
const { authenticateToken } = require('../middleware/jwt');

router.post('/upload-profile', authenticateToken, uploadProfilePicture);
router.get('/profile', authenticateToken, getUserProfile);

module.exports = router;
