const pool = require('../config/databaseConfig');

async function getDashboardOverview(req, res) {
  try {
    // Count pending loans
    const [loanRows] = await pool.execute(
      "SELECT COUNT(*) as pendingLoans FROM loans WHERE status = 'Pending'"
    );
    // Count total transactions (across all customers)
    const [txRows] = await pool.execute(
      "SELECT COUNT(*) as totalTransactions FROM transactions"
    );
    res.json({
      pendingLoans: loanRows[0].pendingLoans,
      totalTransactions: txRows[0].totalTransactions
    });
  } catch (error) {
    console.error("Error fetching dashboard overview:", error);
    res.status(500).json({ message: "Error fetching overview data" });
  }
}

module.exports = { getDashboardOverview };
