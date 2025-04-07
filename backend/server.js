require('dotenv').config();
const express = require('express');
const cors = require('cors');
const path = require('path');
const pool = require('./config/databaseConfig');

const app = express();

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));


// Serve static files from frontend/public folder
app.use(express.static(path.join(__dirname, '../frontend/public')));
app.use(express.static(path.join(__dirname, '../frontend/')));


// Explicit route for reset.html
app.get('/reset.html', (req, res) => {
  res.sendFile(path.join(__dirname, '../frontend/public/reset.html'));
});



// Serve uploaded images statically
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// API Routes
const routes = require('./routes/index');
app.use('/api', routes);

// Global error handler
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({ message: "Internal Server Error" });
});

// Test database connection and start server
(async () => {
  try {
    // Try a simple query to confirm DB connectivity
    const { data, error } = await pool
      .from('users')
      .select('id')
      .limit(1);

    if (error) {
      throw new Error(error.message);
    }

    console.log("Connected to the database successfully!");

    const PORT = process.env.PORT || 5000;
    app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
  } catch (error) {
    console.error("Database connection failed:", error.message);
    process.exit(1);
  }
})();

