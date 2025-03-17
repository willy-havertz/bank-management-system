const DepositPrototype = require('../prototype/deposit.prototype');

// Retrieve all deposits
exports.findAll = (req, res) => {
  console.log("Request Body:", req.body); // Conditional logging for debugging
  
  DepositPrototype.getAll(null, (err, data) => {
    if (err) {
      res.status(500).send({
        message: err.message || 'Some error occurred while retrieving deposits.',
      });
    } else {
      res.send(data);
    }
  });
};

// Retrieve deposits by account ID
exports.findByAccountID = (req, res) => {
  const accountID = req.params.AccountID;

  // Validate if accountID is provided
  if (!accountID) {
    return res.status(400).send({
      message: "Account ID is required to retrieve deposits.",
    });
  }

  DepositPrototype.findByAccountId(accountID, (err, data) => {
    if (err) {
      res.status(500).send({
        message: err.message || 'Some error occurred while retrieving deposit.',
      });
    } else {
      res.send(data);
    }
  });
};

// Create a new deposit
exports.create = (req, res) => {
  if (!req.body || !req.body.deposit) {
    return res.status(400).send({
      message: 'Invalid content! Deposit data is required.',
    });
  }

  const deposit = req.body.deposit;

  // Validate that all required fields are provided
  if (!deposit.accountID || !deposit.amount || !deposit.remark) {
    return res.status(400).send({
      message: 'AccountID, Amount, and Remark are required to create a deposit.',
    });
  }

  // Log the deposit data if needed for debugging
  console.log("Creating deposit:", deposit);

  // Create deposit in the database
  DepositPrototype.create(deposit, (err, data) => {
    if (err) {
      res.status(500).send({
        message: err.message || 'Some error occurred while creating deposit.',
      });
    } else {
      res.send(data);
    }
  });
};
