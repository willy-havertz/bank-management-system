// notificationController.js
const pool = require('../config/databaseConfig');

async function getNotifications(req, res) {
  try {
    const userId = req.user.id;
    // Update 'createdAt' to the correct column name (e.g., 'date')
    const [rows] = await pool.execute(
      "SELECT * FROM notifications WHERE userId = ? ORDER BY date DESC",
      [userId]
    );
    res.json(rows);
  } catch (error) {
    console.error("Error fetching notifications:", error);
    res.status(500).json({ message: "Error fetching notifications" });
  }
}
async function getEmployeeNotifications(req, res) {
  try {
    // For example, suppose notifications intended for employees have a flag "forEmployee = 1"
    const [rows] = await pool.execute(
      "SELECT * FROM notifications WHERE forEmployee = 1 ORDER BY date DESC"
    );
    // rows should be an array
    res.json(rows);
  } catch (error) {
    console.error("Error fetching employee notifications:", error);
    res.status(500).json({ message: "Error fetching notifications" });
  }
}

module.exports = { getNotifications, getEmployeeNotifications };
