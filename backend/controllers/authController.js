const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const UserPrototype = require('../prototypes/userPrototype');
const pool = require('../config/databaseConfig');
const { sendResetEmail } = require('../utils/mailer');
require('dotenv').config();

async function register(req, res) {
  try {
    const { name, email, password, phone, idNumber, role } = req.body;
    console.log('Register request received with:', { name, email, phone, idNumber, role });
    
    if (!name || !email || !password || !phone || !idNumber) {
      console.log('Missing required fields');
      return res.status(400).json({ message: "Missing required fields" });
    }
    
    const existing = await UserPrototype.findByEmail(email);
    console.log('Existing user lookup result:', existing);
    if (existing.length) {
      console.log('User already exists:', email);
      return res.status(400).json({ message: "User already exists" });
    }
    
    const hashedPassword = await bcrypt.hash(password, 10);
    // For customers, initial balance is set to Ksh 0; employees start with 0.
    const initialBalance = role === 'customer' ? 0 : 0;
    
    await UserPrototype.create({ name, email, password: hashedPassword, phone, idNumber, role, balance: initialBalance });
    console.log('User created successfully:', email);
    
    res.status(201).json({ message: "User registered successfully" });
  } catch (err) {
    console.error("Error in register:", err);
    res.status(500).json({ message: "Error registering user" });
  }
}

async function login(req, res) {
  try {
    const { email, password } = req.body;
    console.log('Login attempt for email:', email);
    
    const users = await UserPrototype.findByEmail(email);
    console.log('User lookup result:', users);
    
    if (users.length === 0) {
      console.log('No user found with email:', email);
      return res.status(401).json({ message: "Invalid email or password" });
    }
    
    const user = users[0];
    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      console.log('Password mismatch for:', email);
      return res.status(401).json({ message: "Invalid email or password" });
    }
    
    const token = jwt.sign(
      { id: user.id, email: user.email, role: user.role, name: user.name },
      process.env.JWT_SECRET,
      { expiresIn: "1h" }
    );
    console.log('Login successful for:', email);
    res.json({ token, role: user.role });
  } catch (err) {
    console.error("Error in login:", err);
    res.status(500).json({ message: "Login error" });
  }
}

async function forgotPassword(req, res) {
  try {
    const { email } = req.body;
    console.log("Received forgotPassword request for:", email);
    
    if (!email) {
      console.log("Email is required but not provided");
      return res.status(400).json({ message: "Email is required" });
    }
    
    const users = await UserPrototype.findByEmail(email);
    console.log('User lookup in forgotPassword:', users);
    if (users.length === 0) {
      console.log("No user found for email:", email);
      return res.status(404).json({ message: "User not found" });
    }
    
    const user = users[0];
    
    if (!process.env.JWT_SECRET) {
      console.error("JWT_SECRET is not defined in environment variables");
      throw new Error("Internal configuration error");
    }
    
    const token = jwt.sign({ id: user.id }, process.env.JWT_SECRET, { expiresIn: "1h" });
    console.log("Generated reset token:", token);
    
    await sendResetEmail(email, token);
    console.log("Reset email sent successfully to:", email);
    
    res.json({ message: "Password reset link sent to your email" });
  } catch (err) {
    console.error("Error processing forgot password:", err);
    res.status(500).json({ message: "Error processing forgot password" });
  }
}

async function resetPassword(req, res) {
  try {
    const { token, newPassword } = req.body;
    // Verify the token (ensure it hasn't expired and is valid)
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    // Hash the new password
    const hashedPassword = await bcrypt.hash(newPassword, 10);
    // Update the user's password in the database
    await pool.execute("UPDATE users SET password = ? WHERE id = ?", [hashedPassword, decoded.id]);
    res.json({ message: "Password reset successfully" });
  } catch (error) {
    console.error("Reset password error:", error);
    res.status(400).json({ message: "Invalid or expired token" });
  }
}

module.exports = { register, login, forgotPassword, resetPassword };
