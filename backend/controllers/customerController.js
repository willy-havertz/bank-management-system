const CustomerPrototype = require('../prototype/customer.prototype');

// Retrieve all customers
exports.findAll = (req, res) => {
  console.log(req.body);
  const name = req.body.name;
  
  // Add validation for name if needed
  if (!name) {
    return res.status(400).send({
      message: "Name is required to search customers."
    });
  }

  CustomerPrototype.getAll(name, req, (err, data) => {
    if (err) {
      res.status(500).send({
        message: err.message || 'Some error occurred while retrieving customers.'
      });
    } else {
      res.send(data);
    }
  });
};

// Create a new customer
exports.createCustomer = (req, res) => {
  console.log(req.body);
  
  const customer = req.body.customer;

  // Add validation for customer object fields
  if (!customer || !customer.name || !customer.email) {
    return res.status(400).send({
      message: "Customer name and email are required."
    });
  }

  CustomerPrototype.create(customer, req, (err, data) => {
    if (err) {
      res.status(500).send({
        message: err.message || 'Some error occurred while creating customers.'
      });
    } else {
      res.send(data);
    }
  });
};

// Retrieve a customer by ID
exports.getFromID = (req, res) => {
  const id = req.params.id;  // Use params to get the ID

  console.log(id);  // Log the id

  // Validate if id is provided
  if (!id) {
    return res.status(400).send({
      message: "Customer ID is required."
    });
  }

  CustomerPrototype.findById(id, req, (err, data) => {
    if (err) {
      res.status(500).send({
        message: err.message || 'Some error occurred while retrieving customer.'
      });
    } else {
      res.send(data);
    }
  });
};

// Update a customer by ID
exports.updateCustomer = (req, res) => {
  const id = req.params.id; // Get the customer ID from the URL params
  const customer = req.body.customer;  // Get customer details from the body

  console.log(req.body, req.params);

  // Validate if customer object is provided
  if (!customer) {
    return res.status(400).send({
      message: "Customer data is required for update."
    });
  }

  // If id is not provided
  if (!id) {
    return res.status(400).send({
      message: "Customer ID is required to update."
    });
  }

  CustomerPrototype.updateById(id, req, (err, data) => {
    if (err) {
      res.status(500).send({
        message: err.message || 'Some error occurred while updating customer.'
      });
    } else {
      res.send(data);
    }
  });
};
