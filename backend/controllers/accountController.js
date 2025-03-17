const AccountPrototype = require('../prototype/account.prototype');

// Retrieve accounts for a customer
exports.findAll = (req, res) => {
  if (!req.user) {
    return res.status(401).send({ message: 'Unauthorized: No user data provided.' });
  }

  const customerID = req.user.CustomerID;

  AccountPrototype.getAll(customerID, req, (err, data) => {
    if (err) {
      if (err.kind === 'not_found') {
        return res.status(404).send({ message: `No accounts found for customer ${customerID}.` });
      } else {
        return res.status(500).send({ message: err.message || 'An error occurred while retrieving accounts.' });
      }
    }
    res.send(data);
  });
};

// Retrieve an account by ID
exports.getFromID = (req, res) => {
  const accountID = req.params.id;

  AccountPrototype.findById(accountID, req, (err, data) => {
    if (err) {
      if (err.kind === 'not_found') {
        return res.status(404).send({ message: `No account found with id ${accountID}.` });
      } else if (err.kind === 'access denied') {
        return res.status(401).send({ message: err.message || 'Access Denied to Page' });
      } else {
        return res.status(500).send({ message: err.message || 'An error occurred while retrieving accounts.' });
      }
    }
    res.send(data);
  });
};

// Create a new account
exports.create = (req, res) => {
  if (!req.user) {
    return res.status(401).send({ message: 'Unauthorized: No user data provided.' });
  }

  if (!req.body.account || !req.body.account.customerID || !req.body.account.initialBalance) {
    return res.status(400).send({ message: 'Bad request: Missing account details.' });
  }

  const account = {
    CustomerID: req.body.account.customerID,
    NewbID: req.user.NewbID,
    Balance: req.body.account.initialBalance,
  };

  AccountPrototype.create(account, req, (err, data) => {
    if (err) {
      return res.status(500).send({ message: err.message || 'An error occurred while creating the account.' });
    }
    res.send(data);
  });
};
