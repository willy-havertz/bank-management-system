const WithdrawalPrototype = require('../prototype/withdrawal.prototype');

// Utility function for error handling
const handleError = (res, err, message) => {
  if (!err) {
    return res.status(500).send({ message: message || 'An unexpected error occurred.' });
  }

  if (err.kind === 'not_found') {
    return res.status(404).send({ message: message || 'Resource not found.' });
  }

  return res.status(500).send({ message: err.message || message || 'Server error.' });
};

// Retrieve all withdrawals
exports.findAll = (req, res) => {
  WithdrawalPrototype.getAll(null, (err, data) => {
    if (err) return handleError(res, err, 'Error retrieving withdrawals.');
    res.send(data);
  });
};

// Retrieve withdrawals by account ID
exports.findByAccountID = (req, res) => {
  const accountID = req.params.accountID; // Changed to camelCase

  if (!accountID) {
    return res.status(400).send({ message: 'Account ID is required.' });
  }

  WithdrawalPrototype.findByAccountId(accountID, (err, data) => {
    if (err) return handleError(res, err, `Error retrieving withdrawals for account ${accountID}`);
    res.send(data);
  });
};

// Create a new withdrawal
exports.create = (req, res) => {
  // Destructure withdrawal details directly from request body
  const { accountID, amount, remark } = req.body;

  // Validate required fields
  if (!accountID || !amount || !remark) {
    return res.status(400).send({
      message: 'AccountID, amount, and remark are required.',
    });
  }

  // Create withdrawal object
  const withdrawal = { accountID, amount, remark };

  // Insert into database
  WithdrawalPrototype.create(withdrawal, (err, data) => {
    if (err) return handleError(res, err, 'Error creating withdrawal.');
    res.status(201).send(data);
  });
};
