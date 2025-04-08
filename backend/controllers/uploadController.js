const path = require('path');
const { v4: uuidv4 } = require('uuid');
const formidable = require('formidable'); // Import formidable
const pool = require('../config/databaseConfig'); // Supabase client

// Upload profile picture using Formidable
async function uploadProfilePicture(req, res) {
  const form = new formidable.IncomingForm();

  // Set upload directory (if needed)
  form.uploadDir = path.join(__dirname, '../uploads'); // Directory to store temporary uploaded files
  form.keepExtensions = true; // Retain file extensions

  form.parse(req, async (err, fields, files) => {
    if (err) {
      console.error("Form parsing error:", err);
      return res.status(500).json({ message: "Error parsing the form data" });
    }

    const file = files.file[0]; 

    if (!file) {
      return res.status(400).json({ message: "No file uploaded" });
    }

    const extension = path.extname(file.originalFilename).toLowerCase();
    const allowedTypes = ['.jpeg', '.jpg', '.png', '.gif'];
    if (!allowedTypes.includes(extension)) {
      return res.status(400).json({ message: "Invalid file type. Only .jpeg, .jpg, .png, .gif are allowed." });
    }

    const filename = `${uuidv4()}${extension}`;

    try {
      // Upload to Supabase Storage (bucket name: 'profile-pictures')
      const { error: uploadError } = await pool.storage
        .from('profile-pictures')
        .upload(filename, file.filepath, {
          contentType: file.mimetype,
          upsert: true
        });

      if (uploadError) {
        console.error("Upload Error:", uploadError);
        return res.status(500).json({ message: "Error uploading file to storage." });
      }

      // Make the image publicly accessible and get public URL
      const { data: publicUrlData, error: publicUrlError } = pool.storage
        .from('profile-pictures')
        .getPublicUrl(filename);

      if (publicUrlError) {
        console.error("Public URL Error:", publicUrlError);
        return res.status(500).json({ message: "Error generating public URL." });
      }

      const profilePicUrl = publicUrlData.publicUrl;

      // Update DB with new profile picture URL
      const { error: dbError } = await pool
        .from('users')
        .update({ profile_picture: profilePicUrl })
        .eq('id', req.user.id);

      if (dbError) {
        console.error("DB Update Error:", dbError);
        return res.status(500).json({ message: "Error updating profile picture URL in database." });
      }

      res.json({ message: "Profile picture updated", url: profilePicUrl });
    } catch (uploadErr) {
      console.error("Error during the upload process:", uploadErr);
      res.status(500).json({ message: "Error processing the file upload" });
    }
  });
}

// Get user profile for authenticated user
async function getUserProfile(req, res) {
  try {
    const userId = req.user.id; // Get user ID from the authenticated request

    // Fetch user profile data from the Supabase database
    const { data, error } = await pool
      .from('users')
      .select('*')
      .eq('id', userId)
      .single(); // Ensure a single result is returned

    if (error) {
      console.error("User not found:", error);
      return res.status(404).json({ message: "User not found" });
    }

    // Return the user profile data
    res.json(data);
  } catch (error) {
    console.error("Error fetching user profile:", error);
    res.status(500).json({ message: "Error fetching user profile" });
  }
}

module.exports = { uploadProfilePicture, getUserProfile };
