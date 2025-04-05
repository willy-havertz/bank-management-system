const multer = require('multer');
const path = require('path');
const pool = require('../config/databaseConfig');

const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, './uploads/');
  },
  filename: (req, file, cb) => {
    cb(null, `${Date.now()}-${file.originalname}`);
  }
});

const upload = multer({
  storage,
  limits: { fileSize: 5 * 1024 * 1024 },
  fileFilter: (req, file, cb) => {
    const fileTypes = /jpeg|jpg|png|gif/;
    const mimetype = fileTypes.test(file.mimetype);
    const extname = fileTypes.test(path.extname(file.originalname).toLowerCase());
    if (mimetype && extname) return cb(null, true);
    cb(new Error("Only image files (jpeg, jpg, png, gif) are allowed"));
  }
}).single('profilePic');

function uploadProfilePicture(req, res) {
  upload(req, res, async (err) => {
    if (err) return res.status(400).json({ message: err.message });
    try {
      const userId = req.user.id;
      const profilePic = req.file.filename;
      await pool.execute("UPDATE users SET profile_picture = ? WHERE id = ?", [profilePic, userId]);
      res.json({ message: "Profile picture updated", filename: profilePic });
    } catch (error) {
      console.error(error);
      res.status(500).json({ message: "Database error" });
    }
  });
}

async function getUserProfile(req, res) {
  try {
    const userId = req.user.id; // Assumes your authentication middleware sets req.user
    const [rows] = await pool.execute("SELECT * FROM users WHERE id = ?", [userId]);
    if (rows.length) {
      res.json(rows[0]);
    } else {
      res.status(404).json({ message: "User not found" });
    }
  } catch (error) {
    console.error("Error fetching user profile:", error);
    res.status(500).json({ message: "Database error" });
  }
}


module.exports = { uploadProfilePicture, getUserProfile };
