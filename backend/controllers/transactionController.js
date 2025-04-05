const pool = require('../config/databaseConfig');
const TransactionPrototype = require('../prototypes/transactionPrototype');

async function deposit(req, res) {
  try {
    const { amount } = req.body;
    const userId = req.user.id;
    if (!amount || amount <= 0) return res.status(400).json({ message: "Invalid deposit amount" });
    
    await pool.execute("UPDATE users SET balance = balance + ? WHERE id = ?", [amount, userId]);
    await TransactionPrototype.create(userId, 'Deposit', amount);
    await pool.execute("INSERT INTO notifications (userId, message) VALUES (?, ?)", [userId, `You have deposited Ksh ${amount}.`]);
    res.json({ message: "Deposit successful" });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Deposit error" });
  }
}

async function withdraw(req, res) {
  try {
    const { amount } = req.body;
    const userId = req.user.id;
    if (!amount || amount <= 0) return res.status(400).json({ message: "Invalid withdrawal amount" });
    
    const [rows] = await pool.execute("SELECT balance FROM users WHERE id = ?", [userId]);
    if (rows[0].balance < amount) return res.status(400).json({ message: "Insufficient balance" });
    
    await pool.execute("UPDATE users SET balance = balance - ? WHERE id = ?", [amount, userId]);
    await TransactionPrototype.create(userId, 'Withdrawal', amount);
    await pool.execute("INSERT INTO notifications (userId, message) VALUES (?, ?)", [userId, `You have withdrawn Ksh ${amount}.`]);
    res.json({ message: "Withdrawal successful" });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Withdrawal error" });
  }
}

async function sendMoney(req, res) {
  try {
    const { recipientEmail, amount } = req.body;
    const senderId = req.user.id;
    if (!recipientEmail || !amount || amount <= 0) return res.status(400).json({ message: "Invalid recipient or amount" });
    
    const [recipientRows] = await pool.execute("SELECT * FROM users WHERE email = ?", [recipientEmail]);
    if (!recipientRows.length) return res.status(404).json({ message: "Recipient not found" });
    const recipient = recipientRows[0];
    
    const [senderRows] = await pool.execute("SELECT balance FROM users WHERE id = ?", [senderId]);
    if (senderRows[0].balance < amount) return res.status(400).json({ message: "Insufficient balance" });
    
    await pool.execute("UPDATE users SET balance = balance - ? WHERE id = ?", [amount, senderId]);
    await pool.execute("UPDATE users SET balance = balance + ? WHERE id = ?", [amount, recipient.id]);
    
    await TransactionPrototype.create(senderId, 'Send', amount);
    await TransactionPrototype.create(recipient.id, 'Receive', amount);
    
    await pool.execute("INSERT INTO notifications (userId, message) VALUES (?, ?)", [senderId, `You sent Ksh ${amount} to ${recipientEmail}.`]);
    await pool.execute("INSERT INTO notifications (userId, message) VALUES (?, ?)", [recipient.id, `You received Ksh ${amount} from an account.`]);
    
    res.json({ message: `Sent Ksh ${amount} successfully` });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Send money error" });
  }
}
// Function to get transactions for the authenticated user
async function getTransactions(req, res) {
  try {
    const userId = req.user.id;
    const [rows] = await pool.execute("SELECT * FROM transactions WHERE userId = ? ORDER BY date DESC", [userId]);
    res.json(rows);
  } catch (err) {
    console.error("Error fetching transactions:", err);
    res.status(500).json({ message: "Error fetching transactions" });
  }
}

// Function to get all transactions (for employee dashboard)
async function getAllTransactions(req, res) {
  try {
    const [rows] = await pool.execute("SELECT * FROM transactions ORDER BY date DESC");
    res.json(rows);
  } catch (err) {
    console.error("Error fetching all transactions:", err);
    res.status(500).json({ message: "Error fetching transactions" });
  }
}

module.exports = { deposit, withdraw, sendMoney, getTransactions, getAllTransactions };
