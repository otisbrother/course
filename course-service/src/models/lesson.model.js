const pool = require('../config/database');

class LessonModel {
  static async findBySectionId(sectionId) {
    const [rows] = await pool.execute(
      'SELECT * FROM lessons WHERE section_id = ? ORDER BY position',
      [sectionId]
    );
    return rows;
  }

  static async findById(id) {
    const [rows] = await pool.execute(
      'SELECT * FROM lessons WHERE id = ?',
      [id]
    );
    return rows[0];
  }

  static async create(lessonData) {
    const { section_id, title, video_url, duration, position } = lessonData;
    
    // Get max position if not provided
    let pos = position;
    if (pos === undefined) {
      const [maxPos] = await pool.execute(
        'SELECT MAX(position) as max_pos FROM lessons WHERE section_id = ?',
        [section_id]
      );
      pos = (maxPos[0].max_pos || 0) + 1;
    }

    const [result] = await pool.execute(
      'INSERT INTO lessons (section_id, title, video_url, duration, position) VALUES (?, ?, ?, ?, ?)',
      [section_id, title, video_url, duration || 0, pos]
    );
    return this.findById(result.insertId);
  }

  static async update(id, lessonData) {
    const { title, video_url, duration, position } = lessonData;
    const fields = [];
    const values = [];

    if (title !== undefined) {
      fields.push('title = ?');
      values.push(title);
    }
    if (video_url !== undefined) {
      fields.push('video_url = ?');
      values.push(video_url);
    }
    if (duration !== undefined) {
      fields.push('duration = ?');
      values.push(duration);
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
      `UPDATE lessons SET ${fields.join(', ')} WHERE id = ?`,
      values
    );
    return this.findById(id);
  }

  static async delete(id) {
    const [result] = await pool.execute('DELETE FROM lessons WHERE id = ?', [id]);
    return result.affectedRows > 0;
  }
}

module.exports = LessonModel;
