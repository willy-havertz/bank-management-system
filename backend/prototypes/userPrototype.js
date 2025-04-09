const pool = require('../config/databaseConfig');

class UserPrototype {
  static async findByEmail(email) {
    const { data, error } = await pool
      .from('users')
      .select('*')
      .eq('email', email);

    if (error) {
      console.error('Error finding user by email:', error.message);
      return [];
    }

    return data;
  }

  static async create({ name, email, password, phone, idNumber, role, balance }) {
    const { data, error } = await pool
      .from('users')
      .insert([{ name, email, password, phone, idNumber, role, balance }])
      .select()
      .single();

    if (error) {
      console.error('Error creating user:', error.message);
      return null;
    }

    return data;
  }

  static async updateProfilePicture(userId, filename) {
    const { error } = await pool
      .from('users')
      .update({ profile_picture: filename })
      .eq('id', userId);

    if (error) {
      console.error('Error updating profile picture:', error.message);
    }
  }

  static async getOverview(userId) {
    const { data, error } = await pool
      .from('users')
      .select('name, email, phone, idNumber, balance')
      .eq('id', userId)
      .single();

    if (error) {
      console.error('Error getting user overview:', error.message);
      return null;
    }

    // Add "networth" field manually if needed
    return {
      ...data,
      networth: data.balance
    };
  }

  // Updated addToBalance method using 'increment_balance'
  static async addToBalance(userId, amount) {
    const { error } = await pool.rpc('increment_balance', { p_user_id: userId, p_amount: amount });
    if (error) {
      console.error('Error adding to balance:', error.message);
    }
  }
}

module.exports = UserPrototype;
