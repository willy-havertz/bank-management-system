const pool = require('../config/databaseConfig');

// Endpoint for dynamic credit usage data
async function getCreditData(req, res) {
  try {
    // Used Credit: Withdrawals and Sends
    const { data: usedData, error: usedError } = await pool
      .from('transactions')
      .select('amount', { count: 'exact' })
      .in('type', ['Withdrawal', 'Send']);

    if (usedError) {
      console.error('Supabase error fetching used credit:', usedError);
      return res.status(500).json({ message: 'Error fetching used credit data' });
    }

    const usedCredit = usedData?.reduce((sum, row) => sum + row.amount, 0) || 0;

    // Available Credit: Deposits, Receives, Loans
    const { data: availableData, error: availableError } = await pool
      .from('transactions')
      .select('amount', { count: 'exact' })
      .in('type', ['Deposit', 'Receive', 'Loan']);

    if (availableError) {
      console.error('Supabase error fetching available credit:', availableError);
      return res.status(500).json({ message: 'Error fetching available credit data' });
    }

    const availableCredit = availableData?.reduce((sum, row) => sum + row.amount, 0) || 0;

    res.json({ used: usedCredit, available: availableCredit });
  } catch (error) {
    console.error("Unexpected error fetching credit data:", error);
    res.status(500).json({ message: "Error fetching credit data" });
  }
}

// Endpoint for monthly spending data
async function getMonthlySpending(req, res) {
  try {
    const { data, error } = await pool.rpc('get_monthly_spending'); // Supabase RPC or view needed here

    if (error) {
      console.error("Supabase error fetching monthly spending:", error);
      return res.status(500).json({ message: "Error fetching monthly spending data", error: error.message });
    }

    if (!data) {
      return res.status(404).json({ message: 'No monthly spending data found' });
    }

    res.json(data);
  } catch (error) {
    console.error("Unexpected error fetching monthly spending:", error);
    res.status(500).json({ message: "Error fetching monthly spending data" });
  }
}

// Endpoint for employee credit overview
async function getEmployeeCreditData(req, res) {
  try {
    // Total Balance from customer users
    const { data: balanceData, error: balanceError } = await pool
      .from('users')
      .select('balance')
      .eq('role', 'customer');

    if (balanceError) {
      console.error('Supabase error fetching balance data:', balanceError);
      return res.status(500).json({ message: 'Error fetching employee credit data' });
    }

    const totalBalance = balanceData?.reduce((sum, row) => sum + row.balance, 0) || 0;

    // Total Used Credit from withdrawals and sends
    const { data: usedData, error: usedError } = await pool
      .from('transactions')
      .select('amount')
      .in('type', ['Withdrawal', 'Send']);

    if (usedError) {
      console.error('Supabase error fetching used credit data:', usedError);
      return res.status(500).json({ message: 'Error fetching used credit data' });
    }

    const totalUsed = usedData?.reduce((sum, row) => sum + row.amount, 0) || 0;

    res.json({ totalAvailable: totalBalance, totalCreditUsage: totalUsed });
  } catch (error) {
    console.error("Unexpected error fetching employee credit data:", error);
    res.status(500).json({ message: "Error fetching employee credit data" });
  }
}

module.exports = { getCreditData, getMonthlySpending, getEmployeeCreditData };
