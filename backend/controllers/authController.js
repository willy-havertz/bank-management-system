const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const UserPrototype = require('../prototypes/userPrototype');
const supabase = require('../config/databaseConfig'); // RENAMED from pool
const { sendResetEmail } = require('../utils/mailer');
require('dotenv').config();

async function register(req, res) {
  try {
    const { name, email, password, phone, idNumber, role } = req.body;
    console.log('Register request received with:', { name, email, phone, idNumber, role });

    if (!name || !email || !password || !phone || !idNumber) {
      return res.status(400).json({ message: "Missing required fields" });
    }

    const existing = await UserPrototype.findByEmail(email);
    if (existing.length) {
      return res.status(400).json({ message: "User already exists" });
    }

    const hashedPassword = await bcrypt.hash(password, 10);
    const initialBalance = role === 'customer' ? 0 : 0;

    await UserPrototype.create({
      name,
      email,
      password: hashedPassword,
      phone,
      idNumber,
      role,
      balance: initialBalance
    });

    res.status(201).json({ message: "User registered successfully" });
  } catch (err) {
    console.error("Error in register:", err);
    res.status(500).json({ message: "Error registering user" });
  }
}

async function login(req, res) {
  try {
    const { email, password } = req.body;

    const users = await UserPrototype.findByEmail(email);
    if (users.length === 0) {
      return res.status(401).json({ message: "Invalid email or password" });
    }

    const user = users[0];
    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(401).json({ message: "Invalid email or password" });
    }

    const token = jwt.sign(
      { id: user.id, email: user.email, role: user.role, name: user.name },
      process.env.JWT_SECRET,
      { expiresIn: "1h" }
    );

    res.json({ token, role: user.role });
  } catch (err) {
    console.error("Error in login:", err);
    res.status(500).json({ message: "Login error" });
  }
}

async function forgotPassword(req, res) {
  try {
    const { email } = req.body;
    if (!email) {
      return res.status(400).json({ message: "Email is required" });
    }

    const users = await UserPrototype.findByEmail(email);
    if (users.length === 0) {
      return res.status(404).json({ message: "User not found" });
    }

    const user = users[0];
    const token = jwt.sign({ id: user.id }, process.env.JWT_SECRET, { expiresIn: "1h" });

    await sendResetEmail(email, token);
    res.json({ message: "Password reset link sent to your email" });
  } catch (err) {
    console.error("Error processing forgot password:", err);
    res.status(500).json({ message: "Error processing forgot password" });
  }
}

async function resetPassword(req, res) {
  try {
    const { token, newPassword } = req.body;

    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    const hashedPassword = await bcrypt.hash(newPassword, 10);

    const { error } = await supabase
      .from('users')
      .update({ password: hashedPassword })
      .eq('id', decoded.id);

    if (error) {
      console.error("Error updating password:", error);
      return res.status(500).json({ message: "Failed to reset password" });
    }

    res.json({ message: "Password reset successfully" });
  } catch (error) {
    console.error("Reset password error:", error);
    res.status(400).json({ message: "Invalid or expired token" });
  }
}

module.exports = { register, login, forgotPassword, resetPassword };
