const TransactionPrototype = require('../prototype/transaction.prototype');

// Retrieve all outgoing transactions for an account
exports.getAllOutgoing = (req, res) => {
  const accountID = req.params.id;

  if (!accountID) {
    return res.status(400).send({ message: 'Account ID is required' });
  }

  TransactionPrototype.getAllOutgoing(accountID, (err, data) => {
    if (err.kind === 'not_found') {
      return res.status(404).send({
        message: `No outgoing transactions found for account ${accountID}.`,
      });
    } else if (err.kind !== 'success') {
      return res.status(500).send({
        message: err.message || 'Some error occurred while retrieving outgoing transactions.',
      });
    }
    return res.send(data);
  });
};

// Retrieve all incoming transactions for an account
exports.getAllIncoming = (req, res) => {
  const accountID = req.params.id;

  if (!accountID) {
    return res.status(400).send({ message: 'Account ID is required' });
  }

  TransactionPrototype.getAllIncoming(accountID, (err, data) => {
    if (err.kind === 'not_found') {
      return res.status(404).send({
        message: `No incoming transactions found for account ${accountID}.`,
      });
    } else if (err.kind !== 'success') {
      return res.status(500).send({
        message: err.message || 'Some error occurred while retrieving incoming transactions.',
      });
    }
    return res.send(data);
  });
};

// Retrieve a transaction from an account by ID to another account by ID
exports.findFromTo = (req, res) => {
  const fromAccount = req.params.from;
  const toAccount = req.params.to;

  if (!fromAccount || !toAccount) {
    return res.status(400).send({
      message: 'Both fromAccount and toAccount are required to retrieve the transaction.',
    });
  }

  TransactionPrototype.findFromTo(fromAccount, toAccount, (err, data) => {
    if (err.kind === 'not_found') {
      return res.status(404).send({
        message: `No transaction found from account ${fromAccount} to account ${toAccount}.`,
      });
    } else if (err.kind !== 'success') {
      return res.status(500).send({
        message: err.message || 'Some error occurred while retrieving the transaction.',
      });
    }
    return res.send(data);
  });
};

// Create and save a new transaction
exports.create = (req, res) => {
  if (!req.body) {
    return res.status(400).send({
      message: 'Content cannot be empty!',
    });
  }

  const { fromAccountID, toAccountID, amount, remarks } = req.body;

  if (!fromAccountID || !toAccountID || !amount || !remarks) {
    return res.status(400).send({
      message: 'All fields (fromAccountID, toAccountID, amount, remarks) are required.',
    });
  }

  const transaction = {
    FromAccount: fromAccountID,
    ToAccount: toAccountID,
    Amount: amount,
    Remark: remarks,
  };

  TransactionPrototype.create(transaction, (err, data) => {
    if (err.kind === 'error') {
      return res.status(500).send({
        message: err.err || 'Some error occurred while creating the transaction.',
      });
    }
    return res.send(data);
  });
};

// Retrieve all transactions (for admins or reporting)
exports.findAll = (req, res) => {
  TransactionPrototype.getAll(null, (err, data) => {
    if (err) {
      return res.status(500).send({
        message: err.message || 'Some error occurred while retrieving transactions.',
      });
    }
    return res.send(data);
  });
};

// Get branch-specific incoming transactions report
exports.getBranchInReport = (req, res) => {
  const branchID = req.user.BranchID;

  if (!branchID) {
    return res.status(400).send({ message: 'Branch ID is required' });
  }

  TransactionPrototype.getBranchInReport(branchID, (err, data) => {
    if (err.kind === 'error') {
      return res.status(500).send({
        message: err.message || 'Some error occurred while retrieving branch incoming transactions report.',
      });
    }
    return res.send(data);
  });
};

// Get count of incoming transactions for a branch
exports.getBranchInCount = (req, res) => {
  const branchID = req.user.BranchID;

  if (!branchID) {
    return res.status(400).send({ message: 'Branch ID is required' });
  }

  TransactionPrototype.getBranchInCount(branchID, (err, data) => {
    if (err.kind === 'error') {
      return res.status(500).send({
        message: err.message || 'Some error occurred while retrieving branch incoming transaction count.',
      });
    }
    return res.send(data);
  });
};

// Get branch-specific outgoing transactions report
exports.getBranchOutReport = (req, res) => {
  const branchID = req.user.BranchID;

  if (!branchID) {
    return res.status(400).send({ message: 'Branch ID is required' });
  }

  TransactionPrototype.getBranchOutReport(branchID, (err, data) => {
    if (err.kind === 'error') {
      return res.status(500).send({
        message: err.message || 'Some error occurred while retrieving branch outgoing transactions report.',
      });
    }
    return res.send(data);
  });
};

// Get count of outgoing transactions for a branch
exports.getBranchOutCount = (req, res) => {
  const branchID = req.user.BranchID;

  if (!branchID) {
    return res.status(400).send({ message: 'Branch ID is required' });
  }

  TransactionPrototype.getBranchOutCount(branchID, (err, data) => {
    if (err.kind === 'error') {
      return res.status(500).send({
        message: err.message || 'Some error occurred while retrieving branch outgoing transaction count.',
      });
    }
    return res.send(data);
  });
};
