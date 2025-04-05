// dashboardDataController.js
const pool = require('../config/databaseConfig');

// Endpoint for dynamic credit usage data
async function getCreditData(req, res) {
  try {
    // Calculate Used Credit from withdrawals and send money transactions
    const [usedRows] = await pool.execute(
      "SELECT SUM(amount) as usedCredit FROM transactions WHERE type IN ('Withdrawal', 'Send')"
    );
    const usedCredit = usedRows[0].usedCredit || 0;
    
    // Calculate Available Credit from deposits, money received and loans
    const [availableRows] = await pool.execute(
      "SELECT SUM(amount) as availableCredit FROM transactions WHERE type IN ('Deposit', 'Receive', 'Loan')"
    );
    const availableCredit = availableRows[0].availableCredit || 0;
    
    res.json({ used: usedCredit, available: availableCredit });
  } catch (error) {
    console.error("Error fetching credit data:", error);
    res.status(500).json({ message: "Error fetching credit data" });
  }
}

// Endpoint for monthly spending data
async function getMonthlySpending(req, res) {
  try {
    // Example query: group spending transactions by month. Here, we assume spending corresponds to "Withdrawal" type.
    const [rows] = await pool.execute(
      `SELECT DATE_FORMAT(date, '%b') as month, SUM(amount) as totalSpending 
       FROM transactions 
       WHERE type = 'Withdrawal'
       GROUP BY month 
       ORDER BY MIN(date)`
    );
    res.json(rows);
  } catch (error) {
    console.error("Error fetching monthly spending data:", error);
    res.status(500).json({ message: "Error fetching monthly spending data" });
  }
}
async function getEmployeeCreditData(req, res) {
    try {
      // Total Available Credit: Sum of all customer balances
      const [balanceRows] = await pool.execute(
        "SELECT SUM(balance) as totalBalance FROM users WHERE role = 'customer'"
      );
      const totalBalance = parseFloat(balanceRows[0].totalBalance) || 0;
  
      // Total Credit Usage: Sum of amounts from transactions that represent money going out
      // (i.e., withdrawals and send money transactions)
      const [usedRows] = await pool.execute(
        "SELECT SUM(amount) as totalUsed FROM transactions WHERE type IN ('Withdrawal', 'Send')"
      );
      const totalUsed = parseFloat(usedRows[0].totalUsed) || 0;
  
      res.json({ totalAvailable: totalBalance, totalCreditUsage: totalUsed });
    } catch (error) {
      console.error("Error fetching employee credit data:", error);
      res.status(500).json({ message: "Error fetching employee credit data" });
    }
  }
  

module.exports = { getCreditData, getMonthlySpending, getEmployeeCreditData };
