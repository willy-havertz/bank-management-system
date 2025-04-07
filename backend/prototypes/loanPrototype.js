const pool = require('../config/databaseConfig');

class LoanPrototype {
  static async applyLoan(userId, amount, purpose) {
    const { data, error } = await pool
      .from('loans')
      .insert([{ userId, amount, purpose, status: 'Pending' }])
      .select()
      .single(); // return inserted row

    if (error) {
      console.error("Error applying for loan:", error.message);
      return null;
    }

    return data;
  }

  static async getLoansByUser(userId) {
    const { data, error } = await pool
      .from('loans')
      .select('*')
      .eq('userId', userId)
      .order('date', { ascending: false });

    if (error) {
      console.error("Error getting user loans:", error.message);
      return [];
    }

    return data;
  }

  static async getAllPendingLoans() {
    const { data, error } = await pool
      .from('loans')
      .select('*')
      .eq('status', 'Pending')
      .order('date', { ascending: false });

    if (error) {
      console.error("Error getting pending loans:", error.message);
      return [];
    }

    return data;
  }

  static async findById(loanId) {
    const { data, error } = await pool
      .from('loans')
      .select('*')
      .eq('id', loanId)
      .single();

    if (error) {
      console.error("Error finding loan:", error.message);
      return null;
    }

    return data;
  }

  static async updateLoanStatus(loanId, status) {
    const { error } = await pool
      .from('loans')
      .update({ status })
      .eq('id', loanId);

    if (error) {
      console.error("Error updating loan status:", error.message);
    }
  }
}

module.exports = LoanPrototype;
