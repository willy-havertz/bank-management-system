const pool = require('../config/databaseConfig');

async function getCustomerAccounts(req, res) {
  try {
    const [rows] = await pool.execute("SELECT * FROM users WHERE role = ?", ["customer"]);
    res.json(rows);
  } catch (error) {
    console.error("Error fetching customer accounts:", error);
    res.status(500).json({ message: "Database error" });
  }
}

module.exports = { getCustomerAccounts };
