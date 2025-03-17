const sql = require('./db.js');
const bcrypt = require('bcrypt');
const saltRounds = 10;

const OnlineCustomer = function (onlineCustomer) {
  this.CustomerID = onlineCustomer.customerID;
  this.Username = onlineCustomer.username;
  this.Password = onlineCustomer.password;
};

// Create a new online customer
OnlineCustomer.create = async (newOnlineCustomer, result) => {
  console.log('Creating online customer: ', newOnlineCustomer);

  // Validate required fields
  if (!newOnlineCustomer.username || !newOnlineCustomer.password) {
    result({ kind: 'error', message: 'Username and password are required.' }, null);
    return;
  }

  try {
    // Hash the password
    const hash = await bcrypt.hash(newOnlineCustomer.password, saltRounds);
    newOnlineCustomer.password = hash;

    const query = `INSERT INTO OnlineCustomer SET ?`;

    sql.query(query, newOnlineCustomer, (err, res) => {
      if (err) {
        console.log('Error: ', err);
        result({ kind: 'error', message: 'Error creating customer', ...err }, null);
        return;
      }

      console.log('Created online customer: ', { ...newOnlineCustomer });
      result({ kind: 'success' }, { ...newOnlineCustomer });
    });
  } catch (err) {
    console.log('Error hashing password: ', err);
    result({ kind: 'error', message: 'Error hashing password', ...err }, null);
  }
};

// Find customer by username
OnlineCustomer.findByUsername = (username, result) => {
  console.log('Finding online customer by username: ', username);

  // Validate username input
  if (!username) {
    result({ kind: 'error', message: 'Username is required.' }, null);
    return;
  }

  const query = `SELECT * FROM OnlineCustomer WHERE Username = ?`;

  sql.query(query, username, (err, res) => {
    if (err) {
      console.log('Error: ', err);
      result({ kind: 'error', message: 'Error finding customer', ...err }, null);
      return;
    }

    if (res.length) {
      console.log('Found online customer: ', res[0]);
      result({ kind: 'success' }, res[0]);
    } else {
      result({ kind: 'not_found', message: 'Customer not found' }, null);
    }
  });
};

// Delete an online customer
OnlineCustomer.delete = (id, result) => {
  console.log('Deleting online customer with ID: ', id);

  if (!id) {
    result({ kind: 'error', message: 'Customer ID is required.' }, null);
    return;
  }

  const query = `DELETE FROM OnlineCustomer WHERE CustomerID = ?`;

  sql.query(query, id, (err, res) => {
    if (err) {
      console.log('Error: ', err);
      result({ kind: 'error', message: 'Error deleting customer', ...err }, null);
      return;
    }

    if (res.affectedRows === 0) {
      result({ kind: 'not_found', message: 'Customer not found for deletion' }, null);
      return;
    }

    console.log('Deleted online customer with ID: ', id);
    result({ kind: 'success', message: 'Customer deleted successfully' }, res);
  });
};

module.exports = OnlineCustomer;
