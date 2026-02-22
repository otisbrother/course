const pool = require('../config/database');

class UserModel {
  static async findAll(page = 1, limit = 10) {
    const offset = (page - 1) * limit;
    const [rows] = await pool.execute(
      `SELECT id, email, full_name, role, avatar, status, created_at, updated_at 
       FROM users 
       ORDER BY created_at DESC 
       LIMIT ? OFFSET ?`,
      [String(limit), String(offset)]
    );

    const [countResult] = await pool.execute('SELECT COUNT(*) as total FROM users');
    const total = countResult[0].total;

    return {
      users: rows,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit)
      }
    };
  }

  static async findById(id) {
    const [rows] = await pool.execute(
      `SELECT id, email, full_name, role, avatar, status, created_at, updated_at 
       FROM users WHERE id = ?`,
      [id]
    );
    return rows[0];
  }

  static async findByEmail(email) {
    const [rows] = await pool.execute(
      'SELECT * FROM users WHERE email = ?',
      [email]
    );
    return rows[0];
  }

  static async update(id, userData) {
    const { full_name, avatar, status, role } = userData;
    const fields = [];
    const values = [];

    if (full_name !== undefined) {
      fields.push('full_name = ?');
      values.push(full_name);
    }
    if (avatar !== undefined) {
      fields.push('avatar = ?');
      values.push(avatar);
    }
    if (status !== undefined) {
      fields.push('status = ?');
      values.push(status);
    }
    if (role !== undefined) {
      fields.push('role = ?');
      values.push(role);
    }

    if (fields.length === 0) {
      throw new Error('No fields to update');
    }

    values.push(id);
    await pool.execute(
      `UPDATE users SET ${fields.join(', ')} WHERE id = ?`,
      values
    );

    return this.findById(id);
  }

  static async delete(id) {
    const [result] = await pool.execute('DELETE FROM users WHERE id = ?', [id]);
    return result.affectedRows > 0;
  }

  static async getStats() {
    const [result] = await pool.execute(`
      SELECT 
        COUNT(*) as total,
        SUM(CASE WHEN role = 'student' THEN 1 ELSE 0 END) as students,
        SUM(CASE WHEN role = 'teacher' THEN 1 ELSE 0 END) as teachers,
        SUM(CASE WHEN role = 'admin' THEN 1 ELSE 0 END) as admins,
        SUM(CASE WHEN status = 'active' THEN 1 ELSE 0 END) as active,
        SUM(CASE WHEN status = 'inactive' THEN 1 ELSE 0 END) as inactive
      FROM users
    `);
    return result[0];
  }
}

module.exports = UserModel;
