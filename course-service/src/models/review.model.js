const pool = require('../config/database');

class ReviewModel {
  static async findByCourseId(courseId, page = 1, limit = 10) {
    const offset = (page - 1) * limit;
    const [rows] = await pool.execute(
      `SELECT r.*, u.full_name, u.avatar
       FROM reviews r
       JOIN users u ON r.user_id = u.id
       WHERE r.course_id = ?
       ORDER BY r.created_at DESC
       LIMIT ? OFFSET ?`,
      [courseId, String(limit), String(offset)]
    );

    const [countResult] = await pool.execute(
      'SELECT COUNT(*) as total FROM reviews WHERE course_id = ?',
      [courseId]
    );

    const [avgResult] = await pool.execute(
      'SELECT AVG(rating) as avg_rating FROM reviews WHERE course_id = ?',
      [courseId]
    );

    return {
      reviews: rows,
      pagination: {
        page,
        limit,
        total: countResult[0].total,
        totalPages: Math.ceil(countResult[0].total / limit)
      },
      averageRating: avgResult[0].avg_rating || 0
    };
  }

  static async findById(id) {
    const [rows] = await pool.execute(
      `SELECT r.*, u.full_name, u.avatar
       FROM reviews r
       JOIN users u ON r.user_id = u.id
       WHERE r.id = ?`,
      [id]
    );
    return rows[0];
  }

  static async findByUserAndCourse(userId, courseId) {
    const [rows] = await pool.execute(
      'SELECT * FROM reviews WHERE user_id = ? AND course_id = ?',
      [userId, courseId]
    );
    return rows[0];
  }

  static async create(reviewData) {
    const { user_id, course_id, rating, comment } = reviewData;
    const [result] = await pool.execute(
      'INSERT INTO reviews (user_id, course_id, rating, comment) VALUES (?, ?, ?, ?)',
      [user_id, course_id, rating, comment]
    );
    return this.findById(result.insertId);
  }

  static async update(id, reviewData) {
    const { rating, comment } = reviewData;
    await pool.execute(
      'UPDATE reviews SET rating = ?, comment = ? WHERE id = ?',
      [rating, comment, id]
    );
    return this.findById(id);
  }

  static async delete(id) {
    const [result] = await pool.execute('DELETE FROM reviews WHERE id = ?', [id]);
    return result.affectedRows > 0;
  }
}

module.exports = ReviewModel;
