const sql = require('./db');

// Helper function to handle transaction mapping
const getTransaction = (transaction) => ({
  transactionID: transaction.TransactionID,
  fromAccount: transaction.FromAccount,
  toAccount: transaction.ToAccount,
  amount: transaction.Amount,
  remark: transaction.Remark,
  transactionTime: transaction.TransactionTime,
});

// Generic query execution function
const executeQuery = (query, params, result) => {
  sql.query(query, params, (err, res) => {
    if (err) {
      console.error('Error executing query:', err);
      result({ kind: 'error', message: 'Database error', error: err }, null);
      return;
    }
    result({ kind: 'success', data: res });
  });
};

const Transaction = function (transaction) {
  this.AccountID = transaction.AccountID;
  this.Date = transaction.Date;
  this.Amount = transaction.Amount;
  this.Type = transaction.Type;
};

// Get all outgoing transactions for an account
Transaction.getAllOutgoing = (accountID, result) => {
  const query = 'SELECT * FROM Transaction WHERE FromAccount = ?';
  executeQuery(query, [accountID], (response, transactions) => {
    if (response.kind === 'success' && transactions.length > 0) {
      result(response, transactions.map(getTransaction));
    } else {
      result({ kind: 'not_found', message: 'No outgoing transactions found' }, null);
    }
  });
};

// Get all incoming transactions for an account
Transaction.getAllIncoming = (accountID, result) => {
  const query = 'SELECT * FROM Transaction WHERE ToAccount = ?';
  executeQuery(query, [accountID], (response, transactions) => {
    if (response.kind === 'success' && transactions.length > 0) {
      result(response, transactions.map(getTransaction));
    } else {
      result({ kind: 'not_found', message: 'No incoming transactions found' }, null);
    }
  });
};

// Find transactions between two accounts
Transaction.findFromTo = (fromAccount, toAccount, result) => {
  const query = 'SELECT * FROM Transaction WHERE FromAccount = ? AND ToAccount = ?';
  executeQuery(query, [fromAccount, toAccount], (response, transactions) => {
    if (response.kind === 'success' && transactions.length > 0) {
      result(response, transactions.map(getTransaction));
    } else {
      result({ kind: 'not_found', message: 'No transactions found between these accounts' }, null);
    }
  });
};

// Create a new transaction using a stored procedure
Transaction.create = (newTransaction, result) => {
  const fromAccount = newTransaction.FromAccount; // ✅ Fixed: Correct mapping
  const toAccount = newTransaction.ToAccount;
  const amount = newTransaction.Amount;
  const remark = newTransaction.Remark;

  const query = 'CALL transfers_procedure(?, ?, ?, ?, @code)';
  
  sql.query(query, [fromAccount, toAccount, amount, remark], (err, res) => {
    if (err) {
      console.error('Error creating transaction:', err);
      result({ kind: 'error', message: 'Error creating transaction', error: err }, null);
      return;
    }

    // Retrieve the stored procedure output (@code)
    sql.query('SELECT @code AS resultCode', (err, resultCodeRes) => {
      if (err) {
        console.error('Error retrieving result code:', err);
        result({ kind: 'error', message: 'Transaction status unknown', error: err }, null);
        return;
      }

      const resultCode = resultCodeRes[0].resultCode;
      if (resultCode === 1) {
        console.log('Transaction created successfully:', newTransaction);
        result({ kind: 'success', message: 'Transaction successful' }, newTransaction);
      } else {
        console.warn('Transaction failed due to insufficient balance or other constraints.');
        result({ kind: 'error', message: 'Transaction failed' }, null);
      }
    });
  });
};

// Get a transaction by ID
Transaction.findById = (id, result) => {
  const query = 'SELECT * FROM Transaction WHERE TransactionID = ?';
  executeQuery(query, [id], (response, transactions) => {
    if (response.kind === 'success' && transactions.length > 0) {
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

//Get branch incoming transaction report
Transaction.getBranchInReport = (branchID, result) => {
  const query = `SELECT * FROM Transaction t 
                 LEFT JOIN CashAccount ct ON ct.AccountID = t.ToAccount 
                 WHERE ct.BranchID = ?`;
  executeQuery(query, [branchID], result);
};

// Get branch outgoing transaction report
Transaction.getBranchOutReport = (branchID, result) => {
  const query = `SELECT * FROM Transaction t 
                 LEFT JOIN CashAccount ca ON ca.AccountID = t.FromAccount 
                 WHERE ca.BranchID = ?`;
  executeQuery(query, [branchID], result);
};

// Get the count of incoming transactions for a branch
Transaction.getBranchInCount = (branchID, result) => {
  const query = `SELECT COUNT(*) AS count FROM Transaction t 
                 LEFT JOIN CashAccount ct ON ct.AccountID = t.ToAccount 
                 WHERE ct.BranchID = ?`;
  executeQuery(query, [branchID], (response, count) => {
    result(response.kind === 'success' ? { kind: 'success', count: count[0].count } : response, null);
  });
};

// Get the count of outgoing transactions for a branch
Transaction.getBranchOutCount = (branchID, result) => {
  const query = `SELECT COUNT(*) AS count FROM Transaction t 
                 LEFT JOIN CashAccount ca ON ca.AccountID = t.FromAccount 
                 WHERE ca.BranchID = ?`;
  executeQuery(query, [branchID], (response, count) => {
    result(response.kind === 'success' ? { kind: 'success', count: count[0].count } : response, null);
  });
};

module.exports = Transaction;
