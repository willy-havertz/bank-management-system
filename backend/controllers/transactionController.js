const TransactionPrototype = require('../prototype/transaction.prototype');

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

// Retrieve all outgoing transactions for an account
exports.getAllOutgoing = (req, res) => {
  const accountID = req.params.id;

  if (!accountID) {
    return res.status(400).send({ message: 'Account ID is required.' });
  }

  TransactionPrototype.getAllOutgoing(accountID, (err, data) => {
    if (err) return handleError(res, err, `Error retrieving outgoing transactions for account ${accountID}`);
    res.send(data);
  });
};

// Retrieve all incoming transactions for an account
exports.getAllIncoming = (req, res) => {
  const accountID = req.params.id;

  if (!accountID) {
    return res.status(400).send({ message: 'Account ID is required.' });
  }

  TransactionPrototype.getAllIncoming(accountID, (err, data) => {
    if (err) return handleError(res, err, `Error retrieving incoming transactions for account ${accountID}`);
    res.send(data);
  });
};

// Retrieve a transaction from an account by ID to another account by ID
exports.findFromTo = (req, res) => {
  const { from, to } = req.params;

  if (!from || !to) {
    return res.status(400).send({ message: 'Both fromAccount and toAccount are required.' });
  }

  TransactionPrototype.findFromTo(from, to, (err, data) => {
    if (err) return handleError(res, err, `No transaction found from account ${from} to ${to}.`);
    res.send(data);
  });
};

// Create and save a new transaction
exports.create = (req, res) => {
  if (!req.body) {
    return res.status(400).send({ message: 'Request body cannot be empty.' });
  }

  const { fromAccountID, toAccountID, amount, remarks } = req.body;

  if (!fromAccountID || !toAccountID || !amount || !remarks) {
    return res.status(400).send({ message: 'All fields (fromAccountID, toAccountID, amount, remarks) are required.' });
  }

  const transaction = { FromAccount: fromAccountID, ToAccount: toAccountID, Amount: amount, Remark: remarks };

  TransactionPrototype.create(transaction, (err, data) => {
    if (err) return handleError(res, err, 'Error creating the transaction.');
    res.status(201).send(data);
  });
};

// Retrieve all transactions (for admins or reporting)
exports.findAll = (req, res) => {
  TransactionPrototype.getAll(null, (err, data) => {
    if (err) return handleError(res, err, 'Error retrieving transactions.');
    res.send(data);
  });
};

// Get branch-specific incoming transactions report
exports.getBranchInReport = (req, res) => {
  const branchID = req.user?.BranchID;

  if (!branchID) {
    return res.status(400).send({ message: 'Branch ID is required.' });
  }

  TransactionPrototype.getBranchInReport(branchID, (err, data) => {
    if (err) return handleError(res, err, 'Error retrieving branch incoming transactions report.');
    res.send(data);
  });
};

// Get count of incoming transactions for a branch
exports.getBranchInCount = (req, res) => {
  const branchID = req.user?.BranchID;

  if (!branchID) {
    return res.status(400).send({ message: 'Branch ID is required.' });
  }

  TransactionPrototype.getBranchInCount(branchID, (err, data) => {
    if (err) return handleError(res, err, 'Error retrieving branch incoming transaction count.');
    res.send(data);
  });
};

// Get branch-specific outgoing transactions report
exports.getBranchOutReport = (req, res) => {
  const branchID = req.user?.BranchID;

  if (!branchID) {
    return res.status(400).send({ message: 'Branch ID is required.' });
  }

  TransactionPrototype.getBranchOutReport(branchID, (err, data) => {
    if (err) return handleError(res, err, 'Error retrieving branch outgoing transactions report.');
    res.send(data);
  });
};

// Get count of outgoing transactions for a branch
exports.getBranchOutCount = (req, res) => {
  const branchID = req.user?.BranchID;

  if (!branchID) {
    return res.status(400).send({ message: 'Branch ID is required.' });
  }

  TransactionPrototype.getBranchOutCount(branchID, (err, data) => {
    if (err) return handleError(res, err, 'Error retrieving branch outgoing transaction count.');
    res.send(data);
  });
};
