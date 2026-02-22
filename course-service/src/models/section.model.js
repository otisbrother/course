const pool = require('../config/database');

class SectionModel {
  static async findByCourseId(courseId) {
    const [rows] = await pool.execute(
      'SELECT * FROM sections WHERE course_id = ? ORDER BY position',
      [courseId]
    );
    return rows;
  }

  static async findById(id) {
    const [rows] = await pool.execute(
      'SELECT * FROM sections WHERE id = ?',
      [id]
    );
    return rows[0];
  }

  static async create(sectionData) {
    const { course_id, title, position } = sectionData;
    
    // Get max position if not provided
    let pos = position;
    if (pos === undefined) {
      const [maxPos] = await pool.execute(
        'SELECT MAX(position) as max_pos FROM sections WHERE course_id = ?',
        [course_id]
      );
      pos = (maxPos[0].max_pos || 0) + 1;
    }

    const [result] = await pool.execute(
      'INSERT INTO sections (course_id, title, position) VALUES (?, ?, ?)',
      [course_id, title, pos]
    );
    return this.findById(result.insertId);
  }

  static async update(id, sectionData) {
    const { title, position } = sectionData;
    const fields = [];
    const values = [];

    if (title !== undefined) {
      fields.push('title = ?');
      values.push(title);
    }
    if (position !== undefined) {
      fields.push('position = ?');
      values.push(position);
    }

    if (fields.length === 0) {
      return this.findById(id);
    }

    values.push(id);
    await pool.execute(
      `UPDATE sections SET ${fields.join(', ')} WHERE id = ?`,
      values
    );
    return this.findById(id);
  }

  static async delete(id) {
    const [result] = await pool.execute('DELETE FROM sections WHERE id = ?', [id]);
    return result.affectedRows > 0;
  }
}

module.exports = SectionModel;
