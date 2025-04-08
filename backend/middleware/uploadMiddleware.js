const formidable = require('formidable');

// Middleware to handle file uploads using Formidable
const uploadMiddleware = (req, res, next) => {
  const form = new formidable.IncomingForm();

  form.keepExtensions = true; // Keep the file extensions
  form.maxFileSize = 50 * 1024 * 1024; // Max file size: 50MB
  form.uploadDir = './uploads'; // Directory to store files temporarily

  // Parse the form and handle the uploaded file(s)
  form.parse(req, (err, fields, files) => {
    if (err) {
      console.error("Form parsing error:", err);
      return res.status(500).json({ message: "Error parsing the form data" });
    }

    // Attach the parsed files to the request object
    req.files = files;  // Make sure the uploaded files are accessible via `req.files`

    // Proceed to the next middleware or route handler
    next();
  });
};

module.exports = uploadMiddleware;
