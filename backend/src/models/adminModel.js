const pool = require('../config/db');

const adminModel = {

  findByEmail: async (email) => {
    const result = await pool.query(
      'SELECT * FROM admin WHERE email = $1', [email]
    );
    return result.rows[0];
  },

  findById: async (id) => {
    const result = await pool.query(
      'SELECT * FROM admin WHERE id = $1', [id]
    );
    return result.rows[0];
  },

  // Get all admins (safe - no password)
  getAll: async () => {
    const result = await pool.query(
      `SELECT id, username, email, profile_image, created_at
       FROM admin ORDER BY id ASC`
    );
    return result.rows;
  },

  // Get single admin (safe)
  getProfile: async (id) => {
    const result = await pool.query(
      `SELECT id, username, email, profile_image, created_at
       FROM admin WHERE id = $1`,
      [id]
    );
    return result.rows[0];
  },

  // Create admin
  create: async (username, email, hashedPassword) => {
    const result = await pool.query(
      `INSERT INTO admin (username, email, password)
       VALUES ($1, $2, $3)
       RETURNING id, username, email, created_at`,
      [username, email, hashedPassword]
    );
    return result.rows[0];
  },

  // Update admin
  update: async (id, username, email, current) => {
    const result = await pool.query(
      `UPDATE admin SET username = $1, email = $2
       WHERE id = $3
       RETURNING id, username, email, created_at`,
      [username || current.username, email || current.email, id]
    );
    return result.rows[0];
  },

  // Update profile image
  updateProfileImage: async (id, imagePath) => {
    const result = await pool.query(
      `UPDATE admin SET profile_image = $1
       WHERE id = $2
       RETURNING id, username, email, profile_image`,
      [imagePath, id]
    );
    return result.rows[0];
  },

  // Delete admin
  deleteById: async (id) => {
    await pool.query('DELETE FROM admin WHERE id = $1', [id]);
  },

  saveOtp: async (email, otp) => {
    await pool.query(
      `UPDATE admin SET otp = $1,
       otp_expires_at = NOW() + INTERVAL '5 minutes'
       WHERE email = $2`,
      [otp, email]
    );
  },

  clearOtp: async (email) => {
    await pool.query(
      `UPDATE admin SET otp = NULL, otp_expires_at = NULL
       WHERE email = $1`,
      [email]
    );
  },

  updatePassword: async (email, hashedPassword) => {
    await pool.query(
      'UPDATE admin SET password = $1 WHERE email = $2',
      [hashedPassword, email]
    );
  },

};

module.exports = adminModel;