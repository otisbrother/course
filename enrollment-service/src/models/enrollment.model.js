const pool = require('../config/database');

class EnrollmentModel {
  static async findByUserId(userId, page = 1, limit = 10) {
    const offset = (page - 1) * limit;
    const [rows] = await pool.execute(
      `SELECT e.*, c.title, c.slug, c.thumbnail, c.price, u.full_name as teacher_name
       FROM enrollments e
       JOIN courses c ON e.course_id = c.id
       LEFT JOIN users u ON c.teacher_id = u.id
       WHERE e.user_id = ?
       ORDER BY e.enrolled_at DESC
       LIMIT ? OFFSET ?`,
      [userId, String(limit), String(offset)]
    );

    const [countResult] = await pool.execute(
      'SELECT COUNT(*) as total FROM enrollments WHERE user_id = ?',
      [userId]
    );

    return {
      enrollments: rows,
      pagination: {
        page,
        limit,
        total: countResult[0].total,
        totalPages: Math.ceil(countResult[0].total / limit)
      }
    };
  }

  static async findByCourseId(courseId, page = 1, limit = 10) {
    const offset = (page - 1) * limit;
    const [rows] = await pool.execute(
      `SELECT e.*, u.full_name, u.email, u.avatar
       FROM enrollments e
       JOIN users u ON e.user_id = u.id
       WHERE e.course_id = ?
       ORDER BY e.enrolled_at DESC
       LIMIT ? OFFSET ?`,
      [courseId, String(limit), String(offset)]
    );

    const [countResult] = await pool.execute(
      'SELECT COUNT(*) as total FROM enrollments WHERE course_id = ?',
      [courseId]
    );

    return {
      enrollments: rows,
      pagination: {
        page,
        limit,
        total: countResult[0].total,
        totalPages: Math.ceil(countResult[0].total / limit)
      }
    };
  }

  static async findByUserAndCourse(userId, courseId) {
    const [rows] = await pool.execute(
      'SELECT * FROM enrollments WHERE user_id = ? AND course_id = ?',
      [userId, courseId]
    );
    return rows[0];
  }

  static async findById(id) {
    const [rows] = await pool.execute(
      `SELECT e.*, c.title, c.slug
       FROM enrollments e
       JOIN courses c ON e.course_id = c.id
       WHERE e.id = ?`,
      [id]
    );
    return rows[0];
  }

  static async create(enrollmentData) {
    const { user_id, course_id } = enrollmentData;
    const [result] = await pool.execute(
      'INSERT INTO enrollments (user_id, course_id) VALUES (?, ?)',
      [user_id, course_id]
    );
    return this.findById(result.insertId);
  }

  static async updateProgress(id, progress) {
    await pool.execute(
      'UPDATE enrollments SET progress = ? WHERE id = ?',
      [progress, id]
    );
    return this.findById(id);
  }

  static async delete(id) {
    const [result] = await pool.execute('DELETE FROM enrollments WHERE id = ?', [id]);
    return result.affectedRows > 0;
  }

  static async checkCourseExists(courseId) {
    const [rows] = await pool.execute(
      'SELECT id, status FROM courses WHERE id = ?',
      [courseId]
    );
    return rows[0];
  }

  static async getStats(userId) {
    const [result] = await pool.execute(`
      SELECT 
        COUNT(*) as total_enrollments,
        SUM(CASE WHEN progress = 100 THEN 1 ELSE 0 END) as completed,
        SUM(CASE WHEN progress > 0 AND progress < 100 THEN 1 ELSE 0 END) as in_progress,
        AVG(progress) as avg_progress
      FROM enrollments
      WHERE user_id = ?
    `, [userId]);
    return result[0];
  }
}

module.exports = EnrollmentModel;
