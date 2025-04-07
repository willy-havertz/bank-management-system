const pool = require('../config/databaseConfig');

async function getDashboardOverview(req, res) {
  try {
    // Count pending loans
    const { data: loanData, error: loanError } = await pool
      .from('loans')
      .select('id', { count: 'exact', head: true })
      .eq('status', 'Pending');

    // Count total transactions
    const { data: txData, error: txError } = await pool
      .from('transactions')
      .select('id', { count: 'exact', head: true });

    if (loanError || txError) {
      console.error("Supabase error:", loanError || txError);
      return res.status(500).json({ message: "Error fetching overview data" });
    }

    res.json({
      pendingLoans: loanData?.count ?? 0,
      totalTransactions: txData?.count ?? 0,
    });
  } catch (error) {
    console.error("Unexpected error:", error);
    res.status(500).json({ message: "Error fetching overview data" });
  }
}

module.exports = { getDashboardOverview };
