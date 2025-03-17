const WithdrawalPrototype = require('../prototype/withdrawal.prototype');

exports.findAll = (req, res) => {
  // Retrieve all withdrawals
  WithdrawalPrototype.getAll(null, (err, data) => {
    if (err) {
      return res.status(500).send({
        message: err.message || 'Some error occurred while retrieving withdrawals.',
      });
    }
    return res.send(data);
  });
};

exports.findByAccountID = (req, res) => {
  const accountID = req.params.AccountID;

  // Validate that accountID is provided
  if (!accountID) {
    return res.status(400).send({
      message: 'Account ID is required.',
    });
  }

  // Retrieve withdrawals by accountID
  WithdrawalPrototype.findByAccountId(accountID, (err, data) => {
    if (err) {
      return res.status(500).send({
        message: err.message || 'Some error occurred while retrieving withdrawals.',
      });
    }
    return res.send(data);
  });
};

exports.create = (req, res) => {
  // Check if the request body is provided
  if (!req.body || !req.body.withdrawal) {
    return res.status(400).send({
      message: 'Invalid content!',
    });
  }

  // Destructure withdrawal details from the request body
  const { accountID, amount, remark } = req.body.withdrawal;

  // Validate that the required fields are provided
  if (!accountID || !amount || !remark) {
    return res.status(400).send({
      message: 'AccountID, amount, and remark are required.',
    });
  }

  // Create a withdrawal object
  const withdrawal = {
    accountID,
    amount,
    remark,
  };

  // Create withdrawal in the database
  WithdrawalPrototype.create(withdrawal, (err, data) => {
    if (err) {
      return res.status(500).send({
        message: err.message || 'Some error occurred while creating withdrawal.',
      });
    }
    return res.send(data);
  });
};
