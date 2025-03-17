const AccountPrototype = require('../prototype/account.prototype');

// Retrieve  accounts for a customer
exports.findAll = (req, res) => {
  //console.log(req.params);
  const customerID = req.user.CustomerID;
  AccountPrototype.getAll(customerID, req, (err, data) => {
    if (err.kind === 'not_found') {
      res.status(404).send({
        message: `No accounts found for customer ${customerID}.`,
      });
    } else if (err.kind != 'success') {
      res.status(500).send({
        message:
          err.message || 'An  error occurred while retrieving accounts.',
      });
    } else res.send(data);
  });
};

// Retrieve an account by ID
exports.getFromID = (req, res) => {
  const accountID = req.params.id;
  AccountPrototype.findById(accountID, req, (err, data) => {
    if (err.kind === 'not_found') {
      res.status(404).send({
        message: `No account found with id ${accountID}.`,
      });
    } else if (err.kind != 'success') {
      res.status(500).send({
        message: err.message || 'An  error occurred while retrieving accounts.',
      });
    } else if (err.kind === 'access denied') {
      res.status(401).send({
        message: err.message || 'Access Denied to Page',
      });
    } else res.send(data);
  });
};

// Create a new account
exports.create = (req, res) => {
  console.log(req.user.NewbID);
  const account = {
    CustomerID: req.body.account.customerID,
    NewbID: req.user.NewbID,
    Balance: req.body.account.initialBalance,
  };
  AccountPrototype.create(account, req, (err, data) => {
    if (err.kind === 'error') {
      res.status(500).send({
        message: err.message || 'An  error occurred while retrieving accounts.',
      });
    } else res.send(data);
  });
};
