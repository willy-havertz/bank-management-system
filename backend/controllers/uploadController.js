const path = require('path');
const { v4: uuidv4 } = require('uuid');
const pool = require('../config/databaseConfig'); // Supabase client

// Upload profile picture to Supabase Storage
async function uploadProfilePicture(req, res) {
  try {
    const userId = req.user.id;
    const file = req.file;
    console.log('uploadProfilePicture - User ID:', userId);
    console.log('uploadProfilePicture - File received:', file ? file.originalname : 'No file');

    if (!file) {
      return res.status(400).json({ message: "No file uploaded" });
    }

    // Validate file extension
    const extension = path.extname(file.originalname).toLowerCase();
    console.log('uploadProfilePicture - File extension:', extension);
    const allowedTypes = ['.jpeg', '.jpg', '.png', '.gif'];
    if (!allowedTypes.includes(extension)) {
      return res.status(400).json({ message: "Invalid file type" });
    }

    // Generate unique filename
    const filename = `${uuidv4()}${extension}`;
    console.log('uploadProfilePicture - Generated filename:', filename);

    // Upload to Supabase Storage (bucket name: 'profile-pictures')
    const { error: uploadError } = await pool.storage
      .from('profile-pictures')
      .upload(filename, file.buffer, {
        contentType: file.mimetype,
        upsert: true
      });

    if (uploadError) {
      console.error("uploadProfilePicture - Upload Error:", uploadError);
      throw uploadError;
    }
    console.log("uploadProfilePicture - File uploaded successfully");

    // Get public URL from Supabase Storage
    const { data: publicUrlData, error: urlError } = pool.storage
      .from('profile-pictures')
      .getPublicUrl(filename);
      
    if (urlError) {
      console.error("uploadProfilePicture - Public URL Error:", urlError);
      throw urlError;
    }
    console.log("uploadProfilePicture - Public URL Data:", publicUrlData);

    const profilePicUrl = publicUrlData.publicUrl;
    console.log("uploadProfilePicture - Profile Picture URL:", profilePicUrl);

    // Update the user's profile picture in the database
    const { error: dbError } = await pool
      .from('users')
      .update({ profile_picture: profilePicUrl })
      .eq('id', userId);

    if (dbError) {
      console.error("uploadProfilePicture - Database Update Error:", dbError);
      throw dbError;
    }
    console.log("uploadProfilePicture - Database updated successfully");

    res.json({ message: "Profile picture updated", url: profilePicUrl });
  } catch (err) {
    console.error("uploadProfilePicture - Controller Error:", err);
    res.status(500).json({ message: "Upload error" });
  }
}

// Get profile for authenticated user
async function getUserProfile(req, res) {
  try {
    const userId = req.user.id;
    console.log('getUserProfile - Fetching profile for User ID:', userId);

    const { data, error } = await pool
      .from('users')
      .select('*')
      .eq('id', userId)
      .single();

    if (error) {
      console.error("getUserProfile - Error fetching profile:", error);
      return res.status(404).json({ message: "User not found" });
    }

    console.log("getUserProfile - Profile data:", data);
    res.json(data);
  } catch (error) {
    console.error("getUserProfile - Controller Error:", error);
    res.status(500).json({ message: "Error fetching user profile" });
  }
}

module.exports = { uploadProfilePicture, getUserProfile };
