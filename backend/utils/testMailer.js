// testMailer.js
require('dotenv').config();
const nodemailer = require('nodemailer');

const transporter = nodemailer.createTransport({
  service: 'Gmail',
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS
  }
});

async function sendTestEmail() {
  try {
    const info = await transporter.sendMail({
      from: process.env.EMAIL_USER,
      to: process.env.EMAIL_USER, // send to yourself for testing
      subject: 'Test Email',
      html: '<p>This is a test email.</p>'
    });
    console.log("Email sent:", info.response);
  } catch (err) {
    console.error("Error sending email:", err);
  }
}

sendTestEmail();
