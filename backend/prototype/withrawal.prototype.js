const { query } = require('express');
const sql = require('./db.js');

const Withdrawal = function (withdrawal) {
  this.AccountID = withdrawal.AccountID;
  this.Amount = withdrawal.Amount;
  this.Remark = withdrawal.Remark;
  this.WithdrawalTime = withdrawal.WithdrawalTime;
};

Withdrawal.getAll = (transactionID, result) => {
  let query1 = 'SELECT * FROM Withdrawal';

  console.log('Executing query:', query1);
  sql.query(query1, (err, res) => {
    if (err) {
      console.error('Error executing query:', err);
      result(err, null);
      return;
    }

    console.log('Withdrawals: ', res);
    result(null, res);
  });
};

Withdrawal.findById = (id, result) => {
  const query = 'SELECT * FROM Withdrawal WHERE TransactionID = ?';
  console.log('Executing query:', query, 'with id:', id);

  sql.query(query, [id], (err, res) => {
    if (err) {
      console.error('Error executing query:', err);
      result(err, null);
      return;
    }

    if (res.length) {
      console.log('Found withdrawal: ', res[0]);
      result(null, res[0]);
    } else {
      console.log('No withdrawal found with id:', id);
      result({ kind: 'not_found' }, null);
    }
  });
};

Withdrawal.findByAccountId = (accountid, result) => {
  const query = 'SELECT * FROM Withdrawal WHERE AccountID = ?';
  console.log('Executing query:', query, 'with accountid:', accountid);

  sql.query(query, [accountid], (err, res) => {
    if (err) {
      console.error('Error executing query:', err);
      result(err, null);
      return;
    }

    if (res.length) {
      console.log('Found withdrawals: ', res);
      result(null, res);
    } else {
      console.log('No withdrawals found with accountid:', accountid);
      result({ kind: 'not_found' }, null);
    }
  });
};

Withdrawal.create = (newWithdrawal, result) => {
  console.log('Creating new withdrawal:', newWithdrawal);
  const query = 'call withdrawals_procedure(?,?,?,@code)';
  
  sql.query(query, [newWithdrawal.accountID, newWithdrawal.amount, newWithdrawal.remark], (err, res) => {
    if (err) {
      console.error('Error executing procedure:', err);
      result(err, null);
      return;
    }

    console.log('Procedure executed successfully, fetching result code');
    sql.query('SELECT @code', (err, res) => {
      if (err) {
        console.error('Error fetching result code:', err);
        result(err, null);
        return;
      }

      console.log('Result code:', res);
      result(null, res);
    });
  });
};

module.exports = Withdrawal;