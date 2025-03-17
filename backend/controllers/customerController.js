const onlineCustomers = require("../prototype/online.customer.prototype");
const jwt = require("jsonwebtoken");
const bcrypt = require("bcrypt");
require("dotenv").config();

const JWT_SECRET = process.env.JWT_SECRET;

// Debugging: Ensure JWT_SECRET is properly loaded
if (!JWT_SECRET) {
  console.error("ERROR: JWT_SECRET is not defined. Check your .env file.");
  process.exit(1); // Stop execution if missing
}

// Customer Login
exports.customerLogin = async (req, res) => {
  try {
    console.log("Login request received:", req.body);

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

    // Retrieve user from database
    onlineCustomers.findByUsername(userName, async (err, data) => {
      if (err) {
        console.error("Error retrieving user:", err);
        return res.status(err.kind === "not_found" ? 404 : 500).send({
          auth: "fail",
          message: err.kind === "not_found" ? "User not found." : "Error retrieving user.",
        });
      }

      // Debug: Check what we got from DB
      console.log("Retrieved user:", data);

      // Ensure password exists in retrieved data
      const storedPassword = data.Password || data.password;
      if (!storedPassword) {
        console.error("Error: Password field is missing in database.");
        return res.status(500).send({ auth: "fail", message: "Error: Password not found in DB." });
      }

      // Compare passwords
      const isMatch = await bcrypt.compare(password, storedPassword);
      if (!isMatch) {
        console.warn("Incorrect password for user:", userName);
        return res.status(401).send({
          auth: "fail",
          message: "Incorrect password.",
        });
      }

      // Generate JWT token
      const payload = {
        customerID: data.CustomerID,
        userName: data.userName,
        role: "customer",
      };

      const token = jwt.sign(payload, JWT_SECRET, { expiresIn: "2h" });

      console.log("Login successful for user:", userName);
      res.send({
        auth: "success",
        role: "customer",
        expires: "2h",
        customerID: data.CustomerID,
        userName: data.userName,
        token,
      });
    });
  } catch (error) {
    console.error("Server error during login:", error);
    res.status(500).send({ auth: "fail", message: "Internal Server Error." });
  }
};

// Create New Online Customer
exports.createOnlineCustomer = async (req, res) => {
  try {
    console.log("Create customer request received:", req.body);

    if (!req.body.onlineCustomer) {
      return res.status(400).send({ message: "Missing online customer details." });
    }

    const { userName, password, email } = req.body.onlineCustomer;

    if (!userName || !password || !email) {
      return res.status(400).send({
        message: "Username, password, and email are required to create a customer.",
      });
    }

    // Hash password securely
    const hashedPassword = await bcrypt.hash(password, 10);

    const onlineCustomer = { userName, password: hashedPassword, email };

    onlineCustomers.create(onlineCustomer, (err, data) => {
      if (err) {
        console.error("Error creating customer:", err);
        return res.status(500).send({
          message: err.message || "Some error occurred while creating the customer.",
        });
      }

      console.log("Customer created successfully:", data);
      return res.status(201).send(data);
    });
  } catch (error) {
    console.error("Server error during customer creation:", error);
    res.status(500).send({ message: "Internal Server Error." });
  }
};
