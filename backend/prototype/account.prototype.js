const sql = require('./db');

const Account = function (account) {
  this.CustomerID = account.customerID;
  this.DateCreated = account.dateCreated;
  this.accountType = account.accountType;
  this.balance = account.balance;
  this.WCount = account.wCount;
};

// Retrieve all accounts, with optional filtering by customer ID
Account.getAll = (customerID, req, result) => {
  let query = 'SELECT * FROM CashAccount';

  if (customerID) {
    query += ' WHERE CustomerID = ?';
  }

  sql.query(query, customerID ? [customerID] : [], (err, res) => {
    if (err) {
      console.error('Error retrieving accounts:', err);
      result({ kind: 'error', message: 'Error retrieving accounts' }, null);
      return;
    }

    if (!res.length) {
      return result({ kind: 'not_found', message: 'No accounts found' }, null);
    }

    // Check access control
    if (req.user.role === 'customer' && req.user.CustomerID !== res[0].CustomerID) {
      console.warn('Access denied: Unauthorized account access attempt');
      return result({ kind: 'access denied', message: 'You cannot access other customers\' accounts' }, null);
    }

    console.log('Found accounts:', res);
    return result({ kind: 'success' }, res);
  });
};

// Retrieve an account by its ID
Account.findById = (id, req, result) => {
  sql.query('SELECT * FROM CashAccount WHERE AccountID = ?', [id], (err, res) => {
    if (err) {
      console.error('Error retrieving account by ID:', err);
      return result({ kind: 'error', message: 'Error retrieving account' }, null);
    }

    if (!res.length) {
      return result({ kind: 'not_found', message: 'Account not found' }, null);
    }

    // Check access control
    if (req.user.role === 'customer' && req.user.CustomerID !== res[0].CustomerID) {
      console.warn('Access denied: Unauthorized account access attempt');
      return result({ kind: 'access denied', message: 'You cannot access this account' }, null);
    }

    console.log('Found account:', res[0]);
    return result({ kind: 'success' }, res[0]);
  });
};

// Create a new account
Account.create = (newAccount, req, result) => {
  // Role-based access control
  if (req.user.role !== 'employee' && req.user.role !== 'admin') {
    console.warn('Access denied: Unauthorized account creation attempt');
    return result({ kind: 'access denied', message: 'You do not have permission to create accounts' }, null);
  }

  sql.query('SELECT WCountMax FROM CashAccountType WHERE TypeID = ?', [newAccount.TypeID], (err, res) => {
    if (err) {
      console.error('Error retrieving WCountMax:', err);
      return result({ kind: 'error', message: 'Error retrieving withdrawal count max' }, null);
    }

    // Check if WCountMax exists
    if (!res.length) {
      return result({ kind: 'not_found', message: 'Account type not found' }, null);
    }

    newAccount.WCount = res[0].WCountMax;

    sql.query('INSERT INTO CashAccount SET ?', newAccount, (err, res) => {
      if (err) {
        console.error('Error creating account:', err);
        return result({ kind: 'error', message: 'Error creating account' }, null);
      }

      console.log('Created account:', newAccount);
      return result({ kind: 'success' }, newAccount);
    });
  });
};

// Update the balance of an account
Account.updateBalance = (id, amount, result) => {
  sql.query('UPDATE CashAccount SET Balance = Balance + ? WHERE AccountID = ?', [amount, id], (err, res) => {
    if (err) {
      console.error('Error updating balance:', err);
      return result({ kind: 'error', message: 'Error updating balance' }, null);
    }

    if (res.affectedRows === 0) {
      return result({ kind: 'not_found', message: 'Account not found' }, null);
    }

    console.log('Updated account balance:', { id, amount });
    return result({ kind: 'success' }, { id, amount });
  });
};

module.exports = Account;
