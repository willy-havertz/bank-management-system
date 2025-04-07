const pool = require('../config/databaseConfig');

class TransactionPrototype {
  static async create(userId, type, amount) {
    const { data, error } = await pool
      .from('transactions')
      .insert([{ userId, type, amount }])
      .select()
      .single(); // return the inserted row

    if (error) {
      console.error('Error creating transaction:', error.message);
      return null;
    }

    return data;
  }

  static async getTransactionsByUser(userId) {
    const { data, error } = await pool
      .from('transactions')
      .select('*')
      .eq('userId', userId)
      .order('date', { ascending: false });

    if (error) {
      console.error('Error fetching transactions:', error.message);
      return [];
    }

    return data;
  }
}

module.exports = TransactionPrototype;
