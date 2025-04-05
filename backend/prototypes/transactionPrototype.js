const pool = require('../config/databaseConfig');

class TransactionPrototype {
  static async create(userId, type, amount) {
    const [result] = await pool.execute(
      "INSERT INTO transactions (userId, type, amount) VALUES (?, ?, ?)",
      [userId, type, amount]
    );
    return result;
  }

  static async getTransactionsByUser(userId) {
    const [rows] = await pool.execute("SELECT * FROM transactions WHERE userId = ? ORDER BY date DESC", [userId]);
    return rows;
  }
}

module.exports = TransactionPrototype;
