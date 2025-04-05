const pool = require('../config/databaseConfig');

class LoanPrototype {
  static async applyLoan(userId, amount, purpose) {
    const [result] = await pool.execute(
      "INSERT INTO loans (userId, amount, purpose, status) VALUES (?, ?, ?, 'Pending')",
      [userId, amount, purpose]
    );
    return result;
  }

  static async getLoansByUser(userId) {
    const [rows] = await pool.execute(
      "SELECT * FROM loans WHERE userId = ? ORDER BY date DESC",
      [userId]
    );
    return rows;
  }

  static async getAllPendingLoans() {
    const [rows] = await pool.execute(
      "SELECT * FROM loans WHERE status = 'Pending' ORDER BY date DESC"
    );
    return rows;
  }

  static async findById(loanId) {
    const [rows] = await pool.execute(
      "SELECT * FROM loans WHERE id = ?",
      [loanId]
    );
    return rows[0];
  }

  static async updateLoanStatus(loanId, status) {
    await pool.execute("UPDATE loans SET status = ? WHERE id = ?", [status, loanId]);
  }
  
}


module.exports = LoanPrototype;
