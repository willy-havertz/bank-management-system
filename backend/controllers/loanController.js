const LoanPrototype = require('../prototypes/loanPrototype');
const UserPrototype = require('../prototypes/userPrototype');

async function applyLoan(req, res) {
  try {
    const { loanAmount, purpose } = req.body;
    const userId = req.user.id;
    console.log(`applyLoan called for user ${userId} with data:`, { loanAmount, purpose });
    
    if (!loanAmount || loanAmount <= 0 || !purpose) {
      console.warn(`Invalid loan data for user ${userId}:`, { loanAmount, purpose });
      return res.status(400).json({ message: "Invalid loan data" });
    }
    
    await LoanPrototype.applyLoan(userId, loanAmount, purpose);
    console.log(`Loan application submitted successfully for user ${userId}`);
    res.json({ message: "Loan application submitted" });
  } catch (err) {
    console.error("Error in applyLoan:", err);
    res.status(500).json({ message: "Error applying for loan" });
  }
}

async function getLoans(req, res) {
  try {
    const userId = req.user.id;
    console.log(`getLoans called for user ${userId}`);
    const loans = await LoanPrototype.getLoansByUser(userId);
    console.log(`Found ${loans.length} loans for user ${userId}`);
    res.json(loans);
  } catch (err) {
    console.error(`Error fetching loans for user ${req.user.id}:`, err);
    res.status(500).json({ message: "Error fetching loans" });
  }
}

async function getAllPendingLoans(req, res) {
  try {
    console.log("getAllPendingLoans called");
    const pendingLoans = await LoanPrototype.getAllPendingLoans();
    console.log(`Found ${pendingLoans.length} pending loans`);
    res.json(pendingLoans);
  } catch (err) {
    console.error("Error fetching pending loans:", err);
    res.status(500).json({ message: "Error fetching pending loans" });
  }
}

async function approveLoan(req, res) {
  try {
    const { loanId } = req.body;
    if (!loanId) {
      return res.status(400).json({ message: "Loan ID is required" });
    }

    // Fetch loan details first to retrieve userId and amount
    const existingLoan = await LoanPrototype.findById(loanId);
    if (!existingLoan) {
      return res.status(404).json({ message: "Loan not found" });
    }
    
    // Optional: Check if the loan is still pending approval
    if (existingLoan.status !== "Pending") {
      return res.status(400).json({ message: "Loan is not pending approval" });
    }

    // Update the loan status to "approved"
    await LoanPrototype.updateLoanStatus(loanId, "approved");

    // Add the approved loan amount to the user's balance
    await UserPrototype.addToBalance(existingLoan.userId, existingLoan.amount);

    console.log(`Loan ${loanId} approved successfully, and user balance updated`);
    res.json({ message: "Loan approved and balance updated successfully" });
  } catch (error) {
    console.error("Error approving loan:", error);
    res.status(500).json({ message: "Internal server error" });
  }
}

async function rejectLoan(req, res) {
  try {
    const { loanId } = req.body;
    if (!loanId) {
      return res.status(400).json({ message: "Loan ID is required" });
    }
    
    // Check if the loan exists
    const existingLoan = await LoanPrototype.findById(loanId);
    if (!existingLoan) {
      return res.status(404).json({ message: "Loan not found" });
    }

    // Update the loan status to 'rejected'
    await LoanPrototype.updateLoanStatus(loanId, "rejected");
    res.json({ message: "Loan rejected successfully" });
  } catch (error) {
    console.error("Error rejecting loan:", error);
    res.status(500).json({ message: "Internal server error" });
  }
}

module.exports = { applyLoan, getLoans, getAllPendingLoans, approveLoan, rejectLoan };
