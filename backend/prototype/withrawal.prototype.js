const sql = require('./db.js');

const Withdrawal = function (withdrawal) {
  this.AccountID = withdrawal.AccountID;
  this.Amount = withdrawal.Amount;
  this.Remark = withdrawal.Remark;
  this.WithdrawalTime = withdrawal.WithdrawalTime;
};

// Get all withdrawals
Withdrawal.getAll = (result) => {
  const query = 'SELECT * FROM Withdrawal';
  console.log(`Executing query: ${query}`);

  sql.query(query, (err, res) => {
    if (err) {
      console.error('Error executing query:', err);
      result({ kind: 'error', message: 'Database error', error: err }, null);
      return;
    }
    console.log('Withdrawals:', res);
    result({ kind: 'success' }, res);
  });
};

// Find a withdrawal by TransactionID
Withdrawal.findById = (id, result) => {
  const query = 'SELECT * FROM Withdrawal WHERE TransactionID = ?';
  console.log(`Executing query: ${query} with ID: ${id}`);

  sql.query(query, [id], (err, res) => {
    if (err) {
      console.error('Error executing query:', err);
      result({ kind: 'error', message: 'Database error', error: err }, null);
      return;
    }
    if (res.length) {
      console.log('Found withdrawal:', res[0]);
      result({ kind: 'success' }, res[0]);
    } else {
      console.warn(`No withdrawal found with ID: ${id}`);
      result({ kind: 'not_found', message: 'Withdrawal not found' }, null);
    }
  });
};

// Find withdrawals by AccountID
Withdrawal.findByAccountId = (accountID, result) => {
  const query = 'SELECT * FROM Withdrawal WHERE AccountID = ?';
  console.log(`Executing query: ${query} with AccountID: ${accountID}`);

  sql.query(query, [accountID], (err, res) => {
    if (err) {
      console.error('Error executing query:', err);
      result({ kind: 'error', message: 'Database error', error: err }, null);
      return;
    }
    if (res.length) {
      console.log('Found withdrawals:', res);
      result({ kind: 'success' }, res);
    } else {
      console.warn(`No withdrawals found for AccountID: ${accountID}`);
      result({ kind: 'not_found', message: 'No withdrawals found' }, null);
    }
  });
};

// ✅ Create a new withdrawal
Withdrawal.create = (newWithdrawal, result) => {
  console.log('Creating new withdrawal:', newWithdrawal);

  const query = 'CALL withdrawals_procedure(?,?,?,@code)';
  
  sql.query(query, [newWithdrawal.AccountID, newWithdrawal.Amount, newWithdrawal.Remark], (err, res) => {
    if (err) {
      console.error('Error executing procedure:', err);
      result({ kind: 'error', message: 'Error processing withdrawal', error: err }, null);
      return;
    }

    console.log('Procedure executed successfully. Fetching result code...');

    sql.query('SELECT @code AS resultCode', (err, resultCodeRes) => {
      if (err) {
        console.error('Error fetching result code:', err);
        result({ kind: 'error', message: 'Withdrawal status unknown', error: err }, null);
        return;
      }

      const resultCode = resultCodeRes[0].resultCode;
      if (resultCode === 1) {
        console.log('Withdrawal successful:', newWithdrawal);
        result({ kind: 'success', message: 'Withdrawal processed successfully' }, newWithdrawal);
      } else {
        console.warn('Withdrawal failed (e.g., insufficient balance).');
        result({ kind: 'error', message: 'Withdrawal failed' }, null);
      }
    });
  });
};

module.exports = Withdrawal;
