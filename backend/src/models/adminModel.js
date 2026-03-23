const pool = require('../config/db');

const adminModel = {

  // Find admin by email
  findByEmail: async (email) => {
    const result = await pool.query(
      'SELECT * FROM admin WHERE email = $1',
      [email]
    );
    return result.rows[0];
  },

  // Find admin by ID
  findById: async (id) => {
    const result = await pool.query(
      'SELECT * FROM admin WHERE id = $1',
      [id]
    );
    return result.rows[0];
  },

  // Save OTP with expiry (5 minutes)
  saveOtp: async (email, otp) => {
    await pool.query(
      `UPDATE admin
       SET otp = $1,
           otp_expires_at = NOW() + INTERVAL '5 minutes'
       WHERE email = $2`,
      [otp, email]
    );
  },

  // Clear OTP
  clearOtp: async (email) => {
    await pool.query(
      `UPDATE admin
       SET otp = NULL,
           otp_expires_at = NULL
       WHERE email = $1`,
      [email]
    );
  },

  // Update password
  updatePassword: async (email, hashedPassword) => {
    await pool.query(
      'UPDATE admin SET password = $1 WHERE email = $2',
      [hashedPassword, email]
    );
  },

};

module.exports = adminModel;