const sql = require('./db');

const Deposit = function (deposit) {
  this.AccountID = deposit.AccountID;
  this.Amount = deposit.Amount;
  this.Remark = deposit.Remark;
};

// ✅ Get all deposits
Deposit.getAll = (result) => {
  sql.query('SELECT * FROM Deposit', (err, res) => {
    if (err) {
      console.error('❌ Error fetching deposits:', err);
      result({ message: 'Database error' }, null);
      return;
    }
    result(null, res);
  });
};

// ✅ Find deposit by TransactionID
Deposit.findById = (id, result) => {
  sql.query('SELECT * FROM Deposit WHERE TransactionID = ?', [id], (err, res) => {
    if (err) {
      console.error('❌ Error finding deposit by ID:', err);
      result({ message: 'Database error' }, null);
      return;
    }

    if (res.length) {
      console.log('✅ Found deposit:', res[0]);
      result(null, res[0]);
    } else {
      result({ message: 'Deposit not found' }, null);
    }
  });
};

// ✅ Find deposits by AccountID
Deposit.findByAccountId = (accountID, result) => {
  sql.query('SELECT * FROM Deposit WHERE AccountID = ?', [accountID], (err, res) => {
    if (err) {
      console.error('❌ Error finding deposits by AccountID:', err);
      result({ message: 'Database error' }, null);
      return;
    }

    if (res.length) {
      console.log('✅ Found deposits:', res);
      result(null, res);
    } else {
      result({ message: 'No deposits found for the given AccountID' }, null);
    }
  });
};

// ✅ Create a new deposit and update balance using TRANSACTION
Deposit.create = (newDeposit, result) => {
  const { AccountID, Amount, Remark } = newDeposit;

  sql.getConnection((err, connection) => {
    if (err) {
      console.error('❌ Database connection error:', err);
      result({ message: 'Database error' }, null);
      return;
    }

    connection.beginTransaction((err) => {
      if (err) {
        console.error('❌ Error starting transaction:', err);
        result({ message: 'Transaction error' }, null);
        return;
      }

      // 🔹 First, check if the account exists
      connection.query('SELECT Balance FROM CashAccount WHERE AccountID = ?', [AccountID], (err, res) => {
        if (err) {
          console.error('❌ Error checking account:', err);
          connection.rollback(() => result({ message: 'Database error' }, null));
          return;
        }

        if (res.length === 0) {
          console.warn('⚠️ Deposit failed: No matching account found.');
          connection.rollback(() => result({ message: 'Account does not exist' }, null));
          return;
        }

        // 🔹 Update balance first
        connection.query(
          'UPDATE CashAccount SET Balance = Balance + ? WHERE AccountID = ?',
          [Amount, AccountID],
          (err, res) => {
            if (err) {
              console.error('❌ Error updating account balance:', err);
              connection.rollback(() => result({ message: 'Failed to update balance' }, null));
              return;
            }

            if (res.affectedRows === 0) {
              console.warn('⚠️ Deposit failed: Balance update failed.');
              connection.rollback(() => result({ message: 'Deposit failed. No matching account found.' }, null));
              return;
            }

            // 🔹 If balance update is successful, insert deposit record
            connection.query(
              'INSERT INTO Deposit (AccountID, Amount, Remark, DepositTime) VALUES (?, ?, ?, NOW())',
              [AccountID, Amount, Remark],
              (err, res) => {
                if (err) {
                  console.error('❌ Error creating deposit:', err);
                  connection.rollback(() => result({ message: 'Database error' }, null));
                  return;
                }

                // ✅ COMMIT Transaction
                connection.commit((err) => {
                  if (err) {
                    console.error('❌ Transaction commit error:', err);
                    connection.rollback(() => result({ message: 'Transaction error' }, null));
                    return;
                  }

                  console.log('✅ Deposit created successfully:', {
                    TransactionID: res.insertId,
                    AccountID,
                    Amount,
                    Remark,
                  });

                  result(null, {
                    message: 'Deposit successful',
                    deposit: {
                      TransactionID: res.insertId,
                      AccountID,
                      Amount,
                      Remark,
                      DepositTime: new Date(),
                    },
                  });
                });
              }
            );
          }
        );
      });
    });

    connection.release();
  });
};

module.exports = Deposit;
