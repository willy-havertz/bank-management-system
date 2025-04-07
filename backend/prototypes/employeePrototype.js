const UserPrototype = require('./userPrototype');
const pool = require('../config/databaseConfig');

class EmployeePrototype extends UserPrototype {
  static async findById(id) {
    const { data, error } = await pool
      .from('users')
      .select('*')
      .eq('id', id)
      .eq('role', 'employee')
      .single(); // expects only one match

    if (error) {
      console.error('Error fetching employee by ID:', error.message);
      return null;
    }

    return data;
  }
}

module.exports = EmployeePrototype;

