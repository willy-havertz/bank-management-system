const pool = require('../config/databaseConfig');

async function getNotifications(req, res) {
  try {
    const userId = req.user.id;

    const { data, error } = await pool
      .from('notifications')
      .select('*')
      .eq('userId', userId)
      .order('date', { ascending: false });

    if (error) {
      throw error;
    }

    res.json(data);
  } catch (error) {
    console.error("Error fetching notifications:", error.message);
    res.status(500).json({ message: "Error fetching notifications" });
  }
}

async function getEmployeeNotifications(req, res) {
  try {
    const { data, error } = await pool
      .from('notifications')
      .select('*')
      .eq('forEmployee', true)
      .order('date', { ascending: false });

    if (error) {
      throw error;
    }

    res.json(data);
  } catch (error) {
    console.error("Error fetching employee notifications:", error.message);
    res.status(500).json({ message: "Error fetching notifications" });
  }
}

module.exports = { getNotifications, getEmployeeNotifications };
