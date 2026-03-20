const nodemailer = require('nodemailer');
require('dotenv').config();

const transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS,
  },
});

const sendOtpEmail = async (toEmail, otp) => {
  const mailOptions = {
    from: process.env.EMAIL_USER,
    to: toEmail,
    subject: 'LetzECO - Your OTP Code',
    html: `
      <h2>LetzECO Password Reset</h2>
      <p>Your OTP code is:</p>
      <h1 style="color: #22c55e; letter-spacing: 8px;">${otp}</h1>
      <p>This code expires in <strong>5 minutes</strong>.</p>
      <p>If you did not request this, ignore this email.</p>
    `,
  };

  await transporter.sendMail(mailOptions);
};

module.exports = { sendOtpEmail };