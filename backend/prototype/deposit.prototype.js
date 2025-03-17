const { query } = require('express');
const sql = require('./db.js');

const Deposit = function (deposit) {
  this.AccountID = deposit.AccountID;
  this.Amount = deposit.Amount;
  this.Remark = deposit.Remark;
  this.DepositTime = deposit.DepositTime;
};

Deposit.getAll = (transactionID, result) => {
  const query1 = 'SELECT * FROM Deposit';

  sql.query(query1, (err, res) => {
    if (err) {
      console.log('Error fetching all deposits: ', err);
      result(err, null);
      return;
    }

    result(null, res);
  });
};

Deposit.findById = (id, result) => {
  sql.query('SELECT * FROM Deposit WHERE TransactionID = ?', id, (err, res) => {
    if (err) {
      console.log('Error finding deposit by ID: ', err);
      result(err, null);
      return;
    }

    if (res.length) {
      console.log('Found deposit: ', res[0]);
      result(null, res[0]);
    } else {
      result('Deposit not found', null);
    }
  });
};

Deposit.findByAccountId = (accountid, result) => {
  sql.query('SELECT * FROM Deposit WHERE AccountID = ?', accountid, (err, res) => {
    if (err) {
      console.log('Error finding deposits by AccountID: ', err);
      result(err, null);
      return;
    }

    if (res.length) {
      console.log('Found deposits: ', res);
      result(null, res);
    } else {
      result('No deposits found for the given AccountID', null);
    }
  });
};

Deposit.create = (newDeposit, result) => {
  sql.query('INSERT INTO Deposit SET ?', newDeposit, (err, res) => {
    if (err) {
      console.log('Error creating deposit: ', err);
      result(err, null);
      return;
    }

    console.log('Created Deposit: ', newDeposit);
    const account = newDeposit.AccountID;
    const amount = newDeposit.Amount;

    const query0 = 'UPDATE CashAccount SET Balance = Balance + ? WHERE AccountID = ?';

    sql.query(query0, [amount, account], (err, res) => {
      if (err) {
        console.log('Error updating account balance: ', err);
        result(err, null);
        return;
      }

      console.log('Account balance updated');
      if (res.affectedRows === 0) {
        result('Deposit failed. No matching account found.', null);
        return;
      }

      result(null, newDeposit);
    });
  });
};

module.exports = Deposit;
