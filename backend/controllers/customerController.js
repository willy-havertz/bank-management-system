const pool = require('../config/databaseConfig');

async function getCustomerAccounts(req, res) {
  try {
    const { data, error } = await pool
      .from('users')
      .select('*')
      .eq('role', 'customer');

    if (error) {
      console.error("Supabase error:", error);
      return res.status(500).json({ message: "Database error" });
    }

    res.json(data);
  } catch (err) {
    console.error("Unexpected error:", err);
    res.status(500).json({ message: "Server error" });
  }
}

module.exports = { getCustomerAccounts };
