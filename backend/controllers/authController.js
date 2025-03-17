const onlineCustomers = require('../prototype/online.customer.prototype');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcrypt');

require('dotenv').config();

const JWT_SECRET = process.env.JWT_SECRET;

exports.customerLogin = (req, res) => {
  const userName = req.body.loginDetails.userName;
  const password = req.body.loginDetails.password;

  // Validate if userName and password are provided
  if (!userName || !password) {
    return res.status(400).send({
      auth: 'fail',
      message: 'Username and password are required.',
    });
  }

  // Find the customer by username
  onlineCustomers.findByUsername(userName, (err, data) => {
    if (err) {
      if (err.kind === 'not_found') {
        return res.status(404).send({
          auth: 'fail',
          message: 'User not found.',
        });
      }
      return res.status(500).send({
        auth: 'fail',
        message: 'Error retrieving user.',
      });
    }

    // Compare password
    bcrypt.compare(password, data.Password, function (err, result) {
      if (err) {
        return res.status(500).send({
          auth: 'fail',
          message: 'Error during password comparison.',
        });
      }

      // If passwords match
      if (result) {
        // Prepare JWT payload with non-sensitive information
        const payload = {
          customerID: data.CustomerID,
          userName: data.userName,
          role: 'customer',
        };

        // Generate the JWT token
        const token = jwt.sign(payload, JWT_SECRET, { expiresIn: '2h' });

        // Send success response with the token and user info
        return res.send({
          auth: 'success',
          role: 'customer',
          expires: '2h',
          customerID: data.CustomerID,
          userName: data.userName,
          token,
        });
      } else {
        return res.status(401).send({
          auth: 'fail',
          message: 'Incorrect password.',
        });
      }
    });
  });
};



exports.createOnlineCustomer = (req, res) => {
    const onlineCustomer = req.body.onlineCustomer;
  
    // Validate required fields
    if (!onlineCustomer.userName || !onlineCustomer.password || !onlineCustomer.email) {
      return res.status(400).send({
        message: 'Username, password, and email are required to create a customer.',
      });
    }
  
    // Hash the password before storing it
    bcrypt.hash(onlineCustomer.password, 10, (err, hashedPassword) => {
      if (err) {
        return res.status(500).send({
          message: 'Error hashing password.',
        });
      }
  
      // Replace plain password with hashed password
      onlineCustomer.password = hashedPassword;
  
      // Create the customer
      onlineCustomers.create(onlineCustomer, (err, data) => {
        if (err && err.kind === 'error') {
          return res.status(500).send({
            message: err.message || 'Some error occurred while creating the customer.',
          });
        }
  
        // Return created customer data
        return res.status(201).send(data);
      });
    });
  };
  