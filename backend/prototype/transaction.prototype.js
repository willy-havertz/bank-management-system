const sql = require('./db.js');

// Helper function to handle the transaction mapping
const getTransaction = (transaction) => {
  return {
    transactionID: transaction.TransactionID,
    fromAccount: transaction.FromAccount,
    toAccount: transaction.ToAccount,
    amount: transaction.Amount,
    remark: transaction.Remark,
    transactionTime: transaction.TransactionTime,
  };
};

// Helper function for executing queries with a common pattern
const executeQuery = (query, params, result) => {
  sql.query(query, params, (err, res) => {
    if (err) {
      console.log('Error executing query: ', err);
      result({ kind: 'error', message: 'Database error', error: err }, null);
      return;
    }
    result({ kind: 'success' }, res);
  });
};

const Transaction = function (transaction) {
  this.AccountID = transaction.accountID;
  this.Date = transaction.date;
  this.Amount = transaction.amount;
  this.Type = transaction.type;
};

// Get all outgoing transactions for an account
Transaction.getAllOutgoing = (accountID, result) => {
  const query = `SELECT * FROM Transaction WHERE FromAccount = ?`;
  executeQuery(query, [accountID], (response, transactions) => {
    if (response.kind === 'success') {
      const transactionsMapped = transactions.map(getTransaction);
      result(response, transactionsMapped);
    } else {
      result(response, null);
    }
  });
};

// Get all incoming transactions for an account
Transaction.getAllIncoming = (accountID, result) => {
  const query = `SELECT * FROM Transaction WHERE ToAccount = ?`;
  executeQuery(query, [accountID], (response, transactions) => {
    if (response.kind === 'success') {
      const transactionsMapped = transactions.map(getTransaction);
      result(response, transactionsMapped);
    } else {
      result(response, null);
    }
  });
};

// Find transactions between two accounts
Transaction.findFromTo = (fromAccount, toAccount, result) => {
  const query = `SELECT * FROM Transaction WHERE FromAccount = ? AND ToAccount = ?`;
  executeQuery(query, [fromAccount, toAccount], (response, transactions) => {
    if (response.kind === 'success') {
      const transactionsMapped = transactions.map(getTransaction);
      result(response, transactionsMapped);
    } else {
      result(response, null);
    }
  });
};

// Create a new transaction
Transaction.create = (newTransaction, result) => {
  const toAccount = newTransaction.FromAccount;
  const fromAccount = newTransaction.ToAccount;
  const amount = newTransaction.Amount;
  const remark = newTransaction.Remark;
  const query = 'CALL transfers_procedure(?, ?, ?, ?, @code)';
  
  sql.query(query, [toAccount, fromAccount, amount, remark], (err, res) => {
    if (err) {
      console.log('Error creating transaction: ', err);
      result({ kind: 'error', message: 'Error creating transaction', error: err }, null);
      return;
    }
    console.log('Created transaction: ', { ...newTransaction });
    result({ kind: 'success' }, { ...newTransaction });
  });
};

// Get a transaction by ID
Transaction.findById = (id, result) => {
  const query = 'SELECT * FROM Transaction WHERE TransactionID = ?';
  executeQuery(query, [id], (response, transactions) => {
    if (response.kind === 'success' && transactions.length) {
      result(response, getTransaction(transactions[0]));
    } else {
      result({ kind: 'not_found', message: 'Transaction not found' }, null);
    }
  });
};

// Get all transactions
Transaction.getAll = (result) => {
  const query = 'SELECT * FROM Transaction';
  executeQuery(query, [], result);
};

// Get branch incoming transaction report
Transaction.getBranchInReport = (branchID, result) => {
  const query = `SELECT * FROM Transaction t LEFT JOIN CashAccount ct ON ct.AccountID = t.ToAccount WHERE ct.BranchID = ?`;
  executeQuery(query, [branchID], result);
};

// Get branch outgoing transaction report
Transaction.getBranchOutReport = (branchID, result) => {
  const query = `SELECT * FROM Transaction t LEFT JOIN CashAccount ca ON ca.AccountID = t.FromAccount WHERE ca.BranchID = ?`;
  executeQuery(query, [branchID], result);
};

// Get the count of incoming transactions for a branch
Transaction.getBranchInCount = (branchID, result) => {
  const query = `SELECT COUNT(*) AS count FROM Transaction t LEFT JOIN CashAccount ct ON ct.AccountID = t.ToAccount WHERE ct.BranchID = ?`;
  executeQuery(query, [branchID], (response, count) => {
    if (response.kind === 'success') {
      result(response, count[0]);
    } else {
      result(response, null);
    }
  });
};

// Get the count of outgoing transactions for a branch
Transaction.getBranchOutCount = (branchID, result) => {
  const query = `SELECT COUNT(*) AS count FROM Transaction t LEFT JOIN CashAccount ca ON ca.AccountID = t.FromAccount WHERE ca.BranchID = ?`;
  executeQuery(query, [branchID], (response, count) => {
    if (response.kind === 'success') {
      result(response, count[0]);
    } else {
      result(response, null);
    }
  });
};

module.exports = Transaction;
