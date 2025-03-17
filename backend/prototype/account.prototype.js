const sql = require('./db');

const Account = function (account) {
  this.CustomerID = account.customerID;
  this.DateCreated = account.dateCreated;
  this.accountType = account.accountType;
  this.balance = account.balance;
  this.WCount = account.wCount;
};

Account.getAll = (customerID, req, result) => {
  let query = 'SELECT * FROM CashAccount';

  if (customerID) {
    query += ` WHERE CustomerID = ${sql.escape(customerID)}`;
  }

  sql.query(query, (err, res) => {
    if (err) {
      console.log('Error retrieving accounts:', err);
      result({ kind: 'error', message: 'Error retrieving accounts' }, null);
      return;
    }

    if (res.length) {
      if (req.user.role === 'customer' && req.user.CustomerID !== res[0].CustomerID) {
        console.log('No access to this account');
        result({ kind: 'access denied', message: 'You cannot access other customers\' accounts' }, null);
        return;
      }
      console.log('Found accounts: ', res);
      result({ kind: 'success' }, res);
    } else {
      result({ kind: 'not_found' }, null);
    }
  });
};

Account.findById = (id, req, result) => {
  sql.query('SELECT * FROM CashAccount WHERE AccountID = ?', id, (err, res) => {
    if (err) {
      console.log('Error retrieving account by ID:', err);
      result({ kind: 'error', message: 'Error retrieving account' }, null);
      return;
    }

    if (res.length) {
      if (req.user.role === 'customer' && req.user.CustomerID !== res[0].CustomerID) {
        console.log('No access to this account');
        result({ kind: 'access denied', message: 'You cannot access this account' }, null);
        return;
      }

      console.log('Found account: ', res[0]);
      result({ kind: 'success' }, res[0]);
    } else {
      result({ kind: 'not_found' }, null);
    }
  });
};

Account.create = (newAccount, req, result) => {
  sql.query('SELECT WCountMax FROM CashAccountType WHERE TypeID = ?', newAccount.TypeID, (err, res) => {
    if (err) {
      console.log('Error retrieving WCountMax:', err);
      result({ kind: 'error', message: 'Error retrieving withdrawal count max' }, null);
      return;
    }

    newAccount.WCount = res[0].WCountMax;

    sql.query('INSERT INTO CashAccount SET ?', newAccount, (err, res) => {
      if (err) {
        console.log('Error creating account:', err);
        result({ kind: 'error', message: 'Error creating account' }, null);
        return;
      }

      if (req.user.role !== 'employee' && req.user.role !== 'admin') {
        console.log('Access denied');
        result({ kind: 'access denied', message: 'You do not have permission to create accounts' }, null);
        return;
      }

      console.log('Created account: ', newAccount);
      result({ kind: 'success' }, newAccount);
    });
  });
};

Account.updateBalance = (id, amount, result) => {
  sql.query(
    'UPDATE CashAccount SET Balance = Balance + ? WHERE AccountID = ?',
    [amount, id],
    (err, res) => {
      if (err) {
        console.log('Error updating balance:', err);
        result({ kind: 'error', message: 'Error updating balance' }, null);
        return;
      }

      if (res.affectedRows == 0) {
        result({ kind: 'not_found', message: 'Account not found' }, null);
      } else {
        console.log('Updated account balance: ', { id: id, amount });
        result({ kind: 'success' }, { id: id, amount });
      }
    }
  );
};

module.exports = Account;

