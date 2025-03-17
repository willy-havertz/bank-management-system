const OnlineLoanModel = require('../prototype/loan.prototype');

// Utility function to handle errors consistently
const handleError = (res, err) => {
  if (!err || !err.kind) {
    return res.status(500).send({ message: 'An unexpected error occurred.' });
  }

  const errorMessages = {
    not_found: { status: 404, message: 'Not found.' },
    already_paid: { status: 400, message: 'Already paid.' },
    access_denied: { status: 401, message: 'Access denied.' }
  };

  const response = errorMessages[err.kind] || { status: 500, message: 'Some error occurred.' };
  return res.status(response.status).send({ message: err.message || response.message });
};

// Retrieve online loans for a customer
exports.getCustomerOnlineLoans = (req, res) => {
  console.log('Fetching online loans for customer:', req.user.CustomerID);

  if (!req.user || !req.user.CustomerID) {
    return res.status(400).send({ message: 'Invalid or missing Customer ID.' });
  }

  OnlineLoanModel.getAll(req.user.CustomerID, (err, data) => {
    if (err) return handleError(res, err);
    res.send(data);
  });
};

// Function to calculate interest rate based on loan amount and duration
const calculateInterestRate = (amount, duration) => {
  let interestRate = 20;

  if (amount > 10000) interestRate += 5;
  if (amount > 100000) interestRate += 10;
  if (amount > 1000000) interestRate += 15;
  if (duration > 12) interestRate += 5;
  if (duration > 24) interestRate += 10;
  if (duration > 36) interestRate += 15;

  return interestRate;  // Removed random factor for consistency
};

// Create a new online loan
exports.createOnlineLoan = (req, res) => {
  if (!req.body || !req.body.loan) {
    return res.status(400).send({ message: 'Loan details are required.' });
  }

  if (!req.user || req.user.role !== 'customer') {
    return res.status(403).send({ message: 'Unauthorized request.' });
  }

  const { amount, duration, savingsAccountID, fdAccountID } = req.body.loan;

  if (!amount || !duration || !savingsAccountID || !fdAccountID) {
    return res.status(400).send({ message: 'All loan fields are required.' });
  }

  const onlineLoan = {
    CustomerID: req.user.CustomerID,
    Amount: amount,
    Duration: duration,
    SavingsAccountID: savingsAccountID,
    FDAccountID: fdAccountID,
    InterestRate: calculateInterestRate(amount, duration),
  };

  console.log('Creating loan:', onlineLoan);

  OnlineLoanModel.create(onlineLoan, (err, data) => {
    if (err) return handleError(res, err);
    res.status(201).send(data);
  });
};

// Retrieve account installments
exports.getAccountInstallments = (req, res) => {
  const LoanID = req.params.LoanID;

  if (!LoanID) {
    return res.status(400).send({ message: 'Loan ID is required.' });
  }

  OnlineLoanModel.getInstallmentsByAccountID(LoanID, (err, data) => {
    if (err) return handleError(res, err);
    res.send(data);
  });
};

// Retrieve unpaid online installments
exports.getUnpaidOnlineInstallments = (req, res) => {
  OnlineLoanModel.getUnpaidOnlineInstallments((err, data) => {
    if (err) return handleError(res, err);
    res.send(data);
  });
};

// Retrieve a specific installment
exports.getInstallment = (req, res) => {
  const installmentID = req.params.installmentID;

  if (!installmentID) {
    return res.status(400).send({ message: 'Installment ID is required.' });
  }

  OnlineLoanModel.getInstallmentByID(installmentID, (err, data) => {
    if (err) return handleError(res, err);
    res.send(data);
  });
};

// Pay an installment
exports.payInstallment = (req, res) => {
  const installmentID = req.params.installmentID;

  if (!installmentID) {
    return res.status(400).send({ message: 'Installment ID is required.' });
  }

  OnlineLoanModel.payInstallment(installmentID, (err, data) => {
    if (err) return handleError(res, err);
    res.send(data);
  });
};
