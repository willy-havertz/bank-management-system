const DepositPrototype = require("../prototype/deposit.prototype");

// Retrieve all deposits
exports.findAll = (req, res) => {
  try {
    console.log("Request received to fetch all deposits");

    DepositPrototype.getAll(null, (err, data) => {
      if (err) {
        console.error("Error retrieving deposits:", err);
        return res.status(500).send({
          message: err.message || "Some error occurred while retrieving deposits.",
        });
      }

      if (!data || data.length === 0) {
        return res.status(404).send({ message: "No deposits found." });
      }

      res.send(data);
    });
  } catch (error) {
    console.error("Unexpected error in findAll:", error);
    res.status(500).send({ message: "Internal server error." });
  }
};

// Retrieve deposits by account ID
exports.findByAccountID = (req, res) => {
  try {
    console.log("Request to find deposits by account ID:", req.params);

    const accountID = req.params.AccountID;
    if (!accountID) {
      return res.status(400).send({ message: "Account ID is required to retrieve deposits." });
    }

    DepositPrototype.findByAccountId(accountID, (err, data) => {
      if (err) {
        console.error("Error retrieving deposit by account ID:", err);
        return res.status(500).send({
          message: err.message || "Some error occurred while retrieving deposit.",
        });
      }

      if (!data || data.length === 0) {
        return res.status(404).send({ message: `No deposits found for Account ID: ${accountID}.` });
      }

      res.send(data);
    });
  } catch (error) {
    console.error("Unexpected error in findByAccountID:", error);
    res.status(500).send({ message: "Internal server error." });
  }
};

// Create a new deposit
exports.create = (req, res) => {
  try {
    console.log("Deposit creation request:", req.body);

    if (!req.body || !req.body.deposit) {
      return res.status(400).send({ message: "Invalid request! Deposit data is required." });
    }

    const { accountID, amount, remark } = req.body.deposit;
    
    if (!accountID || !amount || !remark) {
      return res.status(400).send({
        message: "AccountID, Amount, and Remark are required to create a deposit.",
      });
    }

    if (isNaN(amount) || amount <= 0) {
      return res.status(400).send({ message: "Amount must be a valid positive number." });
    }

    console.log("Creating deposit with details:", { accountID, amount, remark });

    DepositPrototype.create({ accountID, amount, remark }, (err, data) => {
      if (err) {
        console.error("Error creating deposit:", err);
        return res.status(500).send({
          message: err.message || "Some error occurred while creating deposit.",
        });
      }

      console.log("Deposit created successfully:", data);
      res.status(201).send(data);
    });
  } catch (error) {
    console.error("Unexpected error in create:", error);
    res.status(500).send({ message: "Internal server error." });
  }
};
