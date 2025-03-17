const sql = require('./db');

const Customer = function (customer) {
  this.name = customer.name;
  this.dateOfBirth = customer.dateOfBirth;
  this.Address = customer.Address;
  this.Phone = customer.Phone;
  this.occupation = customer.occupation;
};

// Retrieve all customers (Only Admins/Employees)
Customer.getAll = (name, req, result) => {
  if (req.user.role === 'customer') {
    console.warn('Access denied: Customers cannot retrieve all customers');
    return result({ kind: 'access denied', message: 'Unauthorized access' }, null);
  }

  let query = 'SELECT * FROM Customer';
  let params = [];

  if (name) {
    query += ' WHERE name LIKE ?';
    params.push(`%${name}%`);
  }

  sql.query(query, params, (err, res) => {
    if (err) {
      console.error('Error retrieving customers:', err);
      return result({ kind: 'error', message: 'Database error' }, null);
    }

    console.log('Retrieved customers:', res);
    return result(null, res);
  });
};

// Retrieve a customer by ID (Only Admins/Employees)
Customer.findById = (id, req, result) => {
  if (req.user.role === 'customer') {
    console.warn('Access denied: Customers cannot retrieve other customers');
    return result({ kind: 'access denied', message: 'Unauthorized access' }, null);
  }

  sql.query('SELECT * FROM Customer WHERE customerID = ?', [id], (err, res) => {
    if (err) {
      console.error('Error retrieving customer by ID:', err);
      return result({ kind: 'error', message: 'Database error' }, null);
    }

    if (!res.length) {
      return result({ kind: 'not_found', message: 'Customer not found' }, null);
    }

    console.log('Found customer:', res[0]);
    return result(null, res[0]);
  });
};

// Create a new customer (Only Admins/Employees)
Customer.create = (newCustomer, req, result) => {
  if (req.user.role === 'customer') {
    console.warn('Access denied: Customers cannot create customers');
    return result({ kind: 'access denied', message: 'Unauthorized access' }, null);
  }

  // Validate input
  if (!newCustomer || !newCustomer.name || !newCustomer.dateOfBirth || !newCustomer.Address || !newCustomer.Phone || !newCustomer.occupation) {
    return result({ kind: 'invalid_input', message: 'All fields are required' }, null);
  }

  sql.query('INSERT INTO Customer SET ?', newCustomer, (err, res) => {
    if (err) {
      console.error('Error creating customer:', err);
      return result({ kind: 'error', message: 'Database error' }, null);
    }

    console.log('Created Customer:', newCustomer);
    return result(null, { id: res.insertId, ...newCustomer });
  });
};

// Delete a customer by ID (Only Admins/Employees)
Customer.remove = (id, req, result) => {
  if (req.user.role === 'customer') {
    console.warn('Access denied: Customers cannot delete customers');
    return result({ kind: 'access denied', message: 'Unauthorized access' }, null);
  }

  sql.query('DELETE FROM Customer WHERE CustomerID = ?', [id], (err, res) => {
    if (err) {
      console.error('Error deleting customer:', err);
      return result({ kind: 'error', message: 'Database error' }, null);
    }

    if (res.affectedRows === 0) {
      return result({ kind: 'not_found', message: 'Customer not found' }, null);
    }

    console.log(`Deleted customer with ID: ${id}`);
    return result(null, { message: 'Customer deleted successfully' });
  });
};

// Delete all customers (Only Admins/Employees)
Customer.removeAll = (req, result) => {
  if (req.user.role === 'customer') {
    console.warn('Access denied: Customers cannot delete all customers');
    return result({ kind: 'access denied', message: 'Unauthorized access' }, null);
  }

  sql.query('DELETE FROM Customer', (err, res) => {
    if (err) {
      console.error('Error deleting all customers:', err);
      return result({ kind: 'error', message: 'Database error' }, null);
    }

    console.log(`Deleted ${res.affectedRows} customers`);
    return result(null, { message: `Deleted ${res.affectedRows} customers` });
  });
};

// Update a customer by ID (Only Admins/Employees)
Customer.updateById = (id, req, customer, result) => {
  if (req.user.role === 'customer') {
    console.warn('Access denied: Customers cannot update customers');
    return result({ kind: 'access denied', message: 'Unauthorized access' }, null);
  }

  console.log('Updating customer:', { id, ...customer });

  sql.query(
    'UPDATE Customer SET name = ?, dateOfBirth = ?, Address = ?, Phone = ?, occupation = ? WHERE CustomerID = ?',
    [customer.name, customer.dateOfBirth, customer.Address, customer.Phone, customer.occupation, id],
    (err, res) => {
      if (err) {
        console.error('Error updating customer:', err);
        return result({ kind: 'error', message: 'Database error' }, null);
      }

      if (res.affectedRows === 0) {
        return result({ kind: 'not_found', message: 'Customer not found' }, null);
      }

      console.log('Updated customer:', { id, ...customer });
      return result(null, { id, ...customer });
    }
  );
};

module.exports = Customer;
