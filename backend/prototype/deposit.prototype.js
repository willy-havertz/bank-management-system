const sql = require('./db');

const Deposit = function (deposit) {
  this.AccountID = deposit.AccountID;
  this.Amount = deposit.Amount;
  this.Remark = deposit.Remark;
  this.DepositTime = deposit.DepositTime || new Date(); // Default to current time if missing
};

// Get all deposits
Deposit.getAll = (result) => {
  const query1 = 'SELECT * FROM Deposit';
  sql.query(query1, (err, res) => {
    if (err) {
      console.error('Error fetching deposits:', err);
      result({ message: 'Database error' }, null);
      return;
    }
    result(null, res);
  });
};

// Find deposit by TransactionID
Deposit.findById = (id, result) => {
  sql.query('SELECT * FROM Deposit WHERE TransactionID = ?', id, (err, res) => {
    if (err) {
      console.error('Error finding deposit by ID:', err);
      result({ message: 'Database error' }, null);
      return;
    }

    if (res.length) {
      console.log('Found deposit:', res[0]);
      result(null, res[0]);
    } else {
      result({ message: 'Deposit not found' }, null);
    }
  });
};

// ✅ Find deposits by AccountID
Deposit.findByAccountId = (accountID, result) => {
  sql.query('SELECT * FROM Deposit WHERE AccountID = ?', accountID, (err, res) => {
    if (err) {
      console.error('Error finding deposits by AccountID:', err);
      result({ message: 'Database error' }, null);
      return;
    }

    if (res.length) {
      console.log('Found deposits:', res);
      result(null, res);
    } else {
      result({ message: 'No deposits found for the given AccountID' }, null);
    }
  });
};

// Create a new deposit and update balance
Deposit.create = (newDeposit, result) => {
  const accountID = newDeposit.AccountID;
  const amount = newDeposit.Amount;

  // 🔹 First, check if the account exists
  sql.query('SELECT Balance FROM CashAccount WHERE AccountID = ?', accountID, (err, res) => {
    if (err) {
      console.error('Error checking account:', err);
      result({ message: 'Database error' }, null);
      return;
    }

    if (res.length === 0) {
      console.warn('Deposit failed: No matching account found.');
      result({ message: 'Account does not exist' }, null);
      return;
    }

    // 🔹 Update balance first
    sql.query('UPDATE CashAccount SET Balance = Balance + ? WHERE AccountID = ?', [amount, accountID], (err, res) => {
      if (err) {
        console.error('Error updating account balance:', err);
        result({ message: 'Failed to update balance' }, null);
        return;
      }

      if (res.affectedRows === 0) {
        console.warn('Deposit failed: Balance update failed.');
        result({ message: 'Deposit failed. No matching account found.' }, null);
        return;
      }

      // 🔹 If balance update is successful, insert deposit record
      sql.query('INSERT INTO Deposit SET ?', newDeposit, (err, res) => {
        if (err) {
          console.error('Error creating deposit:', err);
          result({ message: 'Database error' }, null);
          return;
        }

        console.log('Deposit created successfully:', newDeposit);
        result(null, { message: 'Deposit successful', deposit: newDeposit });
      });
    });
  });
};

module.exports = Deposit;
