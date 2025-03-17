const sql = require('./db');
const bcrypt = require('bcrypt');
const saltRounds = 10;

const OnlineCustomer = function (onlineCustomer) {
  this.CustomerID = onlineCustomer.CustomerID;
  this.Username = onlineCustomer.Username;
  this.Password = onlineCustomer.Password;
};

// Create a new online customer
OnlineCustomer.create = async (newOnlineCustomer, result) => {
  console.log('Creating online customer: ', newOnlineCustomer);

  // Validate required fields
  if (!newOnlineCustomer.Username || !newOnlineCustomer.Password) {
    result({ kind: 'error', message: 'Username and password are required.' }, null);
    return;
  }

  try {
    // 🔹 Check if username already exists
    const checkQuery = 'SELECT Username FROM OnlineCustomer WHERE Username = ?';
    sql.query(checkQuery, [newOnlineCustomer.Username], async (err, res) => {
      if (err) {
        console.error('Error checking existing username:', err);
        result({ kind: 'error', message: 'Database error' }, null);
        return;
      }

      if (res.length > 0) {
        console.warn('Username already exists:', newOnlineCustomer.Username);
        result({ kind: 'error', message: 'Username already taken' }, null);
        return;
      }

      // 🔹 Hash the password
      const hash = await bcrypt.hash(newOnlineCustomer.Password, saltRounds);
      newOnlineCustomer.Password = hash;

      // 🔹 Insert new customer
      const insertQuery = 'INSERT INTO OnlineCustomer (Username, Password) VALUES (?, ?)';
      sql.query(insertQuery, [newOnlineCustomer.Username, newOnlineCustomer.Password], (err, res) => {
        if (err) {
          console.error('Error inserting new customer:', err);
          result({ kind: 'error', message: 'Database error' }, null);
          return;
        }

        console.log('Created online customer:', { CustomerID: res.insertId, ...newOnlineCustomer });
        result(null, { kind: 'success', CustomerID: res.insertId, Username: newOnlineCustomer.Username });
      });
    });
  } catch (err) {
    console.error('Error hashing password:', err);
    result({ kind: 'error', message: 'Error processing request' }, null);
  }
};

// Find customer by username
OnlineCustomer.findByUsername = (username, result) => {
  console.log('Finding online customer by username:', username);

  if (!username) {
    result({ kind: 'error', message: 'Username is required.' }, null);
    return;
  }

  const query = 'SELECT * FROM OnlineCustomer WHERE Username = ?';
  sql.query(query, [username], (err, res) => {
    if (err) {
      console.error('Error finding customer:', err);
      result({ kind: 'error', message: 'Database error' }, null);
      return;
    }

    if (res.length) {
      console.log('Found online customer:', res[0]);
      result(null, res[0]);
    } else {
      result({ kind: 'not_found', message: 'Customer not found' }, null);
    }
  });
};

// Delete an online customer
OnlineCustomer.delete = (id, result) => {
  console.log('Deleting online customer with ID:', id);

  if (!id) {
    result({ kind: 'error', message: 'Customer ID is required.' }, null);
    return;
  }

  const query = 'DELETE FROM OnlineCustomer WHERE CustomerID = ?';
  sql.query(query, [id], (err, res) => {
    if (err) {
      console.error('Error deleting customer:', err);
      result({ kind: 'error', message: 'Database error' }, null);
      return;
    }

    if (res.affectedRows === 0) {
      result({ kind: 'not_found', message: 'Customer not found for deletion' }, null);
      return;
    }

    console.log('Deleted online customer with ID:', id);
    result(null, { kind: 'success', message: 'Customer deleted successfully' });
  });
};

module.exports = OnlineCustomer;
