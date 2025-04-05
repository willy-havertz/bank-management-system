const UserPrototype = require('./userPrototype');
const pool = require('../config/databaseConfig');

class EmployeePrototype extends UserPrototype {
  static async findById(id) {
    const [rows] = await pool.execute("SELECT * FROM users WHERE id = ? AND role = 'employee'", [id]);
    return rows[0];
  }
}

module.exports = EmployeePrototype;
