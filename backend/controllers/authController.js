const onlineCustomers = require("../prototype/online.customer.prototype");
const jwt = require("jsonwebtoken");
const bcrypt = require("bcrypt");
require("dotenv").config();

const JWT_SECRET = process.env.JWT_SECRET;

// Ensure JWT_SECRET is defined
if (!JWT_SECRET) {
  console.error("FATAL ERROR: JWT_SECRET is not defined.");
}

// Customer Login
exports.customerLogin = (req, res) => {
  if (!req.body.loginDetails) {
    return res.status(400).send({ message: "Invalid request: Missing login details." });
  }

  const { userName, password } = req.body.loginDetails;

  if (!userName || !password) {
    return res.status(400).send({
      auth: "fail",
      message: "Username and password are required.",
    });
  }

  onlineCustomers.findByUsername(userName, (err, data) => {
    if (err) {
      const errorMessage = err.kind === "not_found" ? "User not found." : "Error retrieving user.";
      return res.status(err.kind === "not_found" ? 404 : 500).send({
        auth: "fail",
        message: errorMessage,
      });
    }

    if (!data || !data.Password) {
      return res.status(404).send({ auth: "fail", message: "User not found or password missing." });
    }

    bcrypt.compare(password, data.Password, (err, result) => {
      if (err) {
        return res.status(500).send({
          auth: "fail",
          message: "Error during password comparison.",
        });
      }

      if (result) {
        const payload = {
          customerID: data.CustomerID,
          userName: data.userName,
          role: "customer",
        };

        const token = jwt.sign(payload, JWT_SECRET, { expiresIn: "2h" });

        return res.send({
          auth: "success",
          role: "customer",
          expires: "2h",
          customerID: data.CustomerID,
          userName: data.userName,
          token,
        });
      } else {
        return res.status(401).send({
          auth: "fail",
          message: "Incorrect password.",
        });
      }
    });
  });
};

// Create New Online Customer
exports.createOnlineCustomer = (req, res) => {
  if (!req.body.onlineCustomer) {
    return res.status(400).send({ message: "Missing online customer details." });
  }

  const { userName, password, email } = req.body.onlineCustomer;

  if (!userName || !password || !email) {
    return res.status(400).send({
      message: "Username, password, and email are required to create a customer.",
    });
  }

  bcrypt.hash(password, 10, (err, hashedPassword) => {
    if (err) {
      return res.status(500).send({
        message: "Error hashing password.",
      });
    }

    const onlineCustomer = {
      userName,
      password: hashedPassword,
      email,
    };

    onlineCustomers.create(onlineCustomer, (err, data) => {
      if (err && err.kind === "error") {
        return res.status(500).send({
          message: err.message || "Some error occurred while creating the customer.",
        });
      }

      return res.status(201).send(data);
    });
  });
};
