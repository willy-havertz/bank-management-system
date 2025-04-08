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
  const resetLink = `${process.env.BASE_URL}/public/reset.html?token=${token}`;

  // HTML template for reset email
  const htmlMessage = `
  <html>
    <head>
      <style>
        body {
          font-family: Arial, sans-serif;
          background-color: #f6f6f6;
          color: #333;
          margin: 0;
          padding: 20px;
        }
        .email-container {
          background-color: #fff;
          max-width: 600px;
          margin: 30px auto;
          border: 1px solid #ddd;
          padding: 20px;
          border-radius: 8px;
        }
        .header {
          border-bottom: 1px solid #ddd;
          padding-bottom: 10px;
          margin-bottom: 20px;
        }
        .header h2 {
          margin: 0;
          color: #0073e6;
        }
        .content p {
          line-height: 1.6;
        }
        .button {
          display: inline-block;
          padding: 12px 20px;
          margin: 20px 0;
          background-color: #0073e6;
          color: #fff;
          text-decoration: none;
          border-radius: 4px;
        }
        .footer {
          font-size: 12px;
          color: #777;
          border-top: 1px solid #ddd;
          padding-top: 10px;
          margin-top: 20px;
        }
      </style>
    </head>
    <body>
      <div class="email-container">
        <div class="header">
          <h2>Elite Commerce Bank</h2>
        </div>
        <div class="content">
          <p>Dear User,</p>
          <p>We have received a request to reset the password for your account. To ensure the security of your account, please click the button below:</p>
          <p><a class="button" href="${resetLink}">Reset Your Password</a></p>
          <p>If you did not request this change, please ignore this email or contact our support team immediately.</p>
          <p>This link will expire in 1 hour for security reasons.</p>
          <p>Best Regards,<br>Elite Commerce Bank</p>
        </div>
        <div class="footer">
          <p>If you're having trouble clicking the "Reset Your Password" button, copy and paste the URL below into your web browser:</p>
          <p>${resetLink}</p>
          <p>Please do not reply to this email as it was sent from an unmonitored address.</p>
        </div>
      </div>
    </body>
  </html>
  `;

  try {
    await transporter.sendMail({
      from: process.env.EMAIL_USER,
      to: email,
      subject: 'Reset Your Password',
      html: htmlMessage
    });
    console.log(`Reset email sent to ${email}`);
  } catch (error) {
    console.error("Error sending reset email:", error);
    throw error;
  }
}

module.exports = { sendResetEmail };
