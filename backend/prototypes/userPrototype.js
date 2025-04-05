const pool = require('../config/databaseConfig');

class UserPrototype {
  static async findByEmail(email) {
    const [rows] = await pool.execute("SELECT * FROM users WHERE email = ?", [email]);
    return rows;
  }

  static async create({ name, email, password, phone, idNumber, role, balance }) {
    const [result] = await pool.execute(
      "INSERT INTO users (name, email, password, phone, idNumber, role, balance) VALUES (?, ?, ?, ?, ?, ?, ?)",
      [name, email, password, phone, idNumber, role, balance]
    );
    return result;
  }

  static async updateProfilePicture(userId, filename) {
    await pool.execute("UPDATE users SET profile_picture = ? WHERE id = ?", [filename, userId]);
  }

  static async getOverview(userId) {
    // Here, networth is simply the balance. Adjust if you have investments/creditUtilized.
    const [rows] = await pool.execute(
      "SELECT name, email, phone, idNumber, balance, balance AS networth FROM users WHERE id = ?",
      [userId]
    );
    return rows[0];
  }

  // New method to add an amount to the user's balance
  static async addToBalance(userId, amount) {
    await pool.execute("UPDATE users SET balance = balance + ? WHERE id = ?", [amount, userId]);
  }
}

module.exports = UserPrototype;
