const pool = require('../config/database');

class CategoryModel {
  static async findAll() {
    const [rows] = await pool.execute(
      'SELECT * FROM categories ORDER BY name'
    );
    return rows;
  }

  static async findById(id) {
    const [rows] = await pool.execute(
      'SELECT * FROM categories WHERE id = ?',
      [id]
    );
    return rows[0];
  }

  static async findBySlug(slug) {
    const [rows] = await pool.execute(
      'SELECT * FROM categories WHERE slug = ?',
      [slug]
    );
    return rows[0];
  }

  static async create(categoryData) {
    const { name, slug } = categoryData;
    const [result] = await pool.execute(
      'INSERT INTO categories (name, slug) VALUES (?, ?)',
      [name, slug]
    );
    return this.findById(result.insertId);
  }

  static async update(id, categoryData) {
    const { name, slug } = categoryData;
    await pool.execute(
      'UPDATE categories SET name = ?, slug = ? WHERE id = ?',
      [name, slug, id]
    );
    return this.findById(id);
  }

  static async delete(id) {
    const [result] = await pool.execute('DELETE FROM categories WHERE id = ?', [id]);
    return result.affectedRows > 0;
  }

  static async getCoursesByCategory(categoryId, page = 1, limit = 10) {
    const offset = (page - 1) * limit;
    const [rows] = await pool.execute(
      `SELECT c.* FROM courses c
       JOIN course_categories cc ON c.id = cc.course_id
       WHERE cc.category_id = ? AND c.status = 'published'
       ORDER BY c.created_at DESC
       LIMIT ? OFFSET ?`,
      [categoryId, String(limit), String(offset)]
    );
    return rows;
  }
}

module.exports = CategoryModel;
