const nodemailer = require('nodemailer');
require('dotenv').config();

const transporter = nodemailer.createTransport({
  service: 'Gmail',
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS
  }
});

async function sendResetEmail(email, token) {
  const resetLink = `http://localhost:5000/reset.html?token=${token}`;
  try {
    await transporter.sendMail({
      from: process.env.EMAIL_USER,
      to: email,
      subject: 'Reset Your Password',
      html: `<p>Click <a href="${resetLink}">here</a> to reset your password. This link expires in 1 hour.</p>`
    });
    console.log(`Reset email sent to ${email}`);
  } catch (error) {
    console.error("Error sending reset email:", error);
    throw error;
  }
}

module.exports = { sendResetEmail };
