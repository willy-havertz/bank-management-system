const path = require('path');
const { v4: uuidv4 } = require('uuid');
const pool = require('../config/databaseConfig'); // Supabase client

// Upload profile picture to Supabase Storage
async function uploadProfilePicture(req, res) {
  try {
    const userId = req.user.id;
    const file = req.file;

    if (!file) {
      return res.status(400).json({ message: "No file uploaded" });
    }

    const extension = path.extname(file.originalname).toLowerCase();
    const allowedTypes = ['.jpeg', '.jpg', '.png', '.gif'];
    if (!allowedTypes.includes(extension)) {
      return res.status(400).json({ message: "Invalid file type" });
    }

    const filename = `${uuidv4()}${extension}`;

    // Upload to Supabase Storage (bucket name: 'profile-pictures')
    const { error: uploadError } = await pool.storage
      .from('profile-pictures')
      .upload(filename, file.buffer, {
        contentType: file.mimetype,
        upsert: true
      });

    if (uploadError) throw uploadError;

    // Optional: make the image publicly accessible and get public URL
    const { data: publicUrlData } = pool.storage
      .from('profile-pictures')
      .getPublicUrl(filename);

    const profilePicUrl = publicUrlData.publicUrl;

    // Update DB
    const { error: dbError } = await pool
      .from('users')
      .update({ profile_picture: profilePicUrl })
      .eq('id', userId);

    if (dbError) throw dbError;

    res.json({ message: "Profile picture updated", url: profilePicUrl });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Upload error" });
  }
}

// Get profile for authenticated user
async function getUserProfile(req, res) {
  try {
    const userId = req.user.id;

    const { data, error } = await pool
      .from('users')
      .select('*')
      .eq('id', userId)
      .single();

    if (error) return res.status(404).json({ message: "User not found" });

    res.json(data);
  } catch (error) {
    console.error("Error fetching user profile:", error);
    res.status(500).json({ message: "Error fetching user profile" });
  }
}

module.exports = { uploadProfilePicture, getUserProfile };
