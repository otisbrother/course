const pool = require('../config/database');

class UserModel {
  static async findByEmail(email) {
    const [rows] = await pool.execute(
      'SELECT * FROM users WHERE email = ?',
      [email]
    );
    return rows[0];
  }

  static async findById(id) {
    const [rows] = await pool.execute(
      'SELECT id, email, full_name, role, avatar, status, created_at, updated_at FROM users WHERE id = ?',
      [id]
    );
    return rows[0];
  }

  static async create(userData) {
    const { email, password, full_name, role = 'student' } = userData;
    const [result] = await pool.execute(
      'INSERT INTO users (email, password, full_name, role) VALUES (?, ?, ?, ?)',
      [email, password, full_name, role]
    );
    return { id: result.insertId, email, full_name, role };
  }

  static async updateLastLogin(id) {
    await pool.execute(
      'UPDATE users SET updated_at = NOW() WHERE id = ?',
      [id]
    );
  }
}

module.exports = UserModel;
