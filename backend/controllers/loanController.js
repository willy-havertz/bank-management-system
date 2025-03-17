const OnlineLoanModel = require('../prototype/loan.prototype');

// Utility function to handle errors consistently
const handleError = (res, err) => {
  if (err.kind === 'not_found') {
    res.status(404).send({
      message: err.message || 'Not found.',
    });
  } else if (err.kind === 'already_paid') {
    res.status(400).send({
      message: err.message || 'Already paid.',
    });
  } else if (err.kind === 'access_denied') {
    res.status(401).send({
      message: err.message || 'Access denied.',
    });
  } else {
    res.status(500).send({
      message: err.message || 'Some error occurred.',
    });
  }
};

exports.getCustomerOnlineLoans = (req, res) => {
  console.log('In oloan.controller');
  const customerID = req.user.CustomerID;

  // Ensure we have a valid customer ID before proceeding
  if (!customerID) {
    return res.status(400).send({
      message: 'Customer ID is missing or invalid.',
    });
  }

  OnlineLoanModel.getAll(customerID, (err, data) => {
    if (err) {
      return handleError(res, err);
    }
    res.send(data);
  });
};

function calculateInterestRate(amount, duration) {
  let interestRate = 20;

  // Logic for interest rate based on loan amount and duration
  if (amount > 10000) {
    interestRate += 5;
  }
  if (amount > 100000) {
    interestRate += 10;
  }
  if (amount > 1000000) {
    interestRate += 15;
  }

  // Adjust interest rate based on loan duration
  if (duration > 12) {
    interestRate += 5;
  }
  if (duration > 24) {
    interestRate += 10;
  }
  if (duration > 36) {
    interestRate += 15;
  }

  // Adding a random factor for unpredictability
  interestRate += Math.random() * 5 - 2.5;

  return interestRate;
}

exports.createOnlineLoan = (req, res) => {
  if (!req.body || !req.body.loan) {
    return res.status(400).send({
      message: 'Content cannot be empty or loan information is missing.',
    });
  }

  if (req.user.role !== 'customer') {
    return res.status(403).send({
      message: 'You are not authorized to create an online loan.',
    });
  }

  const { amount, duration, savingsAccountID, fdAccountID } = req.body.loan;

  if (!amount || !duration || !savingsAccountID || !fdAccountID) {
    return res.status(400).send({
      message: 'Loan amount, duration, and account details are required.',
    });
  }

  const onlineLoan = {
    CustomerID: req.user.CustomerID,
    Amount: amount,
    Duration: duration,
    SavingsAccountID: savingsAccountID,
    FDAccountID: fdAccountID,
    InterestRate: calculateInterestRate(amount, duration),
  };

  OnlineLoanModel.create(onlineLoan, (err, data) => {
    if (err) {
      return handleError(res, err);
    }
    res.send(data);
  });
};

exports.getAccountInstallments = (req, res) => {
  const LoanID = req.params.accountID;

  OnlineLoanModel.getInstallmentsByAccountID(LoanID, (err, data) => {
    if (err) {
      return handleError(res, err);
    }
    res.send(data);
  });
};

exports.getUnpaidOnlineInstallments = (req, res) => {
  OnlineLoanModel.getUnpaidOnlineInstallments((err, data) => {
    if (err) {
      return handleError(res, err);
    }
    res.send(data);
  });
};

exports.getInstallment = (req, res) => {
  const installmentID = req.params.installmentID;

  OnlineLoanModel.getInstallmentByID(installmentID, (err, data) => {
    if (err) {
      return handleError(res, err);
    }
    res.send(data);
  });
};

exports.payInstallment = (req, res) => {
  const installmentID = req.params.installmentID;

  OnlineLoanModel.payInstallment(installmentID, (err, data) => {
    if (err) {
      return handleError(res, err);
    }
    res.send(data);
  });
};
