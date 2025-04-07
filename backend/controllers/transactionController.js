const pool = require('../config/databaseConfig'); // Supabase client instance
const TransactionPrototype = require('../prototypes/transactionPrototype');

async function deposit(req, res) {
  try {
    const { amount } = req.body;
    const userId = req.user.id;

    if (!amount || amount <= 0) return res.status(400).json({ message: "Invalid deposit amount" });

    // Call the increment_balance function
    const { data: updatedBalance, error: rpcError } = await pool
      .rpc('increment_balance', { uid: userId, val: amount });

    if (rpcError) {
      console.error("RPC error:", rpcError);
      return res.status(500).json({ message: "Error updating balance" });
    }

    // Proceed to update user balance in the users table after successful RPC call
    const { error: updateError } = await pool
      .from('users')
      .update({ balance: updatedBalance }) // Assuming the RPC returns the updated balance
      .eq('id', userId);

    if (updateError) {
      console.error("Update error:", updateError);
      throw updateError;
    }

    // Log the deposit transaction
    await TransactionPrototype.create(userId, 'Deposit', amount);

    // Insert notification for the user
    await pool
      .from('notifications')
      .insert({ userId, message: `You have deposited Ksh ${amount}.` });

    res.json({ message: "Deposit successful" });
  } catch (err) {
    console.error("Unexpected error:", err);
    res.status(500).json({ message: "Deposit error" });
  }
}


async function withdraw(req, res) {
  try {
    const { amount } = req.body;
    const userId = req.user.id;

    if (!amount || amount <= 0) return res.status(400).json({ message: "Invalid withdrawal amount" });

    // Fetch the user's current balance
    const { data: user, error: balanceError } = await pool
      .from('users')
      .select('balance')
      .eq('id', userId)
      .single();

    if (balanceError || !user) return res.status(400).json({ message: "User not found" });

    if (user.balance < amount) {
      return res.status(400).json({ message: "Insufficient balance" });
    }

    // Call the increment_balance RPC function to subtract the amount from the user's balance
    const { data: updatedBalance, error: rpcError } = await pool
      .rpc('increment_balance', { uid: userId, val: -amount });  // We pass a negative value to decrease the balance

    if (rpcError) {
      console.error("RPC error:", rpcError);
      return res.status(500).json({ message: "Error updating balance" });
    }

    // Proceed with the update (this step may not be necessary depending on how your RPC function is designed)
    const { error: updateError } = await pool
      .from('users')
      .update({ balance: updatedBalance })  // Assuming the RPC returns the updated balance
      .eq('id', userId);

    if (updateError) {
      console.error("Update error:", updateError);
      throw updateError;
    }

    // Log the withdrawal transaction
    await TransactionPrototype.create(userId, 'Withdrawal', amount);

    // Insert notification for the user
    await pool
      .from('notifications')
      .insert({ userId, message: `You have withdrawn Ksh ${amount}.` });

    res.json({ message: "Withdrawal successful" });
  } catch (err) {
    console.error("Unexpected error:", err);
    res.status(500).json({ message: "Withdrawal error" });
  }
}


async function sendMoney(req, res) {
  try {
    const { recipientEmail, amount } = req.body;
    const senderId = req.user.id;

    if (!recipientEmail || !amount || amount <= 0)
      return res.status(400).json({ message: "Invalid recipient or amount" });

    const { data: recipient, error: recipientError } = await pool
      .from('users')
      .select('*')
      .eq('email', recipientEmail)
      .single();

    if (recipientError || !recipient)
      return res.status(404).json({ message: "Recipient not found" });

    const { data: sender, error: senderError } = await pool
      .from('users')
      .select('balance')
      .eq('id', senderId)
      .single();

    if (senderError || sender.balance < amount)
      return res.status(400).json({ message: "Insufficient balance" });

    // Deduct from sender
    await pool
      .from('users')
      .update({ balance: sender.balance - amount })
      .eq('id', senderId);

    // Add to recipient
    await pool
      .from('users')
      .update({ balance: recipient.balance + amount })
      .eq('id', recipient.id);

    // Log transactions
    await TransactionPrototype.create(senderId, 'Send', amount);
    await TransactionPrototype.create(recipient.id, 'Receive', amount);

    // Notifications
    await pool.from('notifications').insert([
      { userId: senderId, message: `You sent Ksh ${amount} to ${recipientEmail}.` },
      { userId: recipient.id, message: `You received Ksh ${amount} from an account.` }
    ]);

    res.json({ message: `Sent Ksh ${amount} successfully` });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Send money error" });
  }
}

async function getTransactions(req, res) {
  try {
    const userId = req.user.id;

    const { data, error } = await pool
      .from('transactions')
      .select('*')
      .eq('userId', userId)
      .order('date', { ascending: false });

    if (error) throw error;

    res.json(data);
  } catch (err) {
    console.error("Error fetching transactions:", err);
    res.status(500).json({ message: "Error fetching transactions" });
  }
}

async function getAllTransactions(req, res) {
  try {
    const { data, error } = await pool
      .from('transactions')
      .select('*')
      .order('date', { ascending: false });

    if (error) throw error;

    res.json(data);
  } catch (err) {
    console.error("Error fetching all transactions:", err);
    res.status(500).json({ message: "Error fetching transactions" });
  }
}

module.exports = { deposit, withdraw, sendMoney, getTransactions, getAllTransactions };
