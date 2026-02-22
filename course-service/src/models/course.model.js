const pool = require('../config/database');

class CourseModel {
  static async findAll(page = 1, limit = 10, filters = {}) {
    const offset = (page - 1) * limit;
    let whereClause = 'WHERE 1=1';
    const values = [];

    if (filters.status) {
      whereClause += ' AND c.status = ?';
      values.push(filters.status);
    }

    if (filters.teacher_id) {
      whereClause += ' AND c.teacher_id = ?';
      values.push(filters.teacher_id);
    }

    if (filters.search) {
      whereClause += ' AND (c.title LIKE ? OR c.description LIKE ?)';
      values.push(`%${filters.search}%`, `%${filters.search}%`);
    }

    if (filters.category_id) {
      whereClause += ' AND cc.category_id = ?';
      values.push(filters.category_id);
    }

    const [rows] = await pool.execute(
      `SELECT DISTINCT c.*, u.full_name as teacher_name
       FROM courses c
       LEFT JOIN users u ON c.teacher_id = u.id
       LEFT JOIN course_categories cc ON c.id = cc.course_id
       ${whereClause}
       ORDER BY c.created_at DESC
       LIMIT ${limit} OFFSET ${offset}`,
      values
    );

    const [countResult] = await pool.execute(
      `SELECT COUNT(DISTINCT c.id) as total
       FROM courses c
       LEFT JOIN course_categories cc ON c.id = cc.course_id
       ${whereClause}`,
      values
    );

    const total = countResult[0].total;

    return {
      courses: rows,
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
      `SELECT c.*, u.full_name as teacher_name
       FROM courses c
       LEFT JOIN users u ON c.teacher_id = u.id
       WHERE c.id = ?`,
      [id]
    );

    if (rows[0]) {
      // Get categories
      const [categories] = await pool.execute(
        `SELECT cat.* FROM categories cat
         JOIN course_categories cc ON cat.id = cc.category_id
         WHERE cc.course_id = ?`,
        [id]
      );
      rows[0].categories = categories;

      // Get sections with lessons
      const [sections] = await pool.execute(
        'SELECT * FROM sections WHERE course_id = ? ORDER BY position',
        [id]
      );

      for (const section of sections) {
        const [lessons] = await pool.execute(
          'SELECT * FROM lessons WHERE section_id = ? ORDER BY position',
          [section.id]
        );
        section.lessons = lessons;
      }
      rows[0].sections = sections;
    }

    return rows[0];
  }

  static async findBySlug(slug) {
    const [rows] = await pool.execute(
      'SELECT * FROM courses WHERE slug = ?',
      [slug]
    );
    return rows[0];
  }

  static async create(courseData) {
    const { title, slug, description, price, teacher_id, thumbnail, status, categories } = courseData;
    
    const connection = await pool.getConnection();
    try {
      await connection.beginTransaction();

      const [result] = await connection.execute(
        `INSERT INTO courses (title, slug, description, price, teacher_id, thumbnail, status)
         VALUES (?, ?, ?, ?, ?, ?, ?)`,
        [title, slug, description || null, price || 0, teacher_id, thumbnail || null, status || 'draft']
      );

      const courseId = result.insertId;

      // Add categories
      if (categories && categories.length > 0) {
        for (const categoryId of categories) {
          await connection.execute(
            'INSERT INTO course_categories (course_id, category_id) VALUES (?, ?)',
            [courseId, categoryId]
          );
        }
      }

      await connection.commit();
      return this.findById(courseId);
    } catch (error) {
      await connection.rollback();
      throw error;
    } finally {
      connection.release();
    }
  }

  static async update(id, courseData) {
    const { title, slug, description, price, thumbnail, status, categories } = courseData;
    const fields = [];
    const values = [];

    if (title !== undefined) {
      fields.push('title = ?');
      values.push(title);
    }
    if (slug !== undefined) {
      fields.push('slug = ?');
      values.push(slug);
    }
    if (description !== undefined) {
      fields.push('description = ?');
      values.push(description);
    }
    if (price !== undefined) {
      fields.push('price = ?');
      values.push(price);
    }
    if (thumbnail !== undefined) {
      fields.push('thumbnail = ?');
      values.push(thumbnail);
    }
    if (status !== undefined) {
      fields.push('status = ?');
      values.push(status);
    }

    const connection = await pool.getConnection();
    try {
      await connection.beginTransaction();

      if (fields.length > 0) {
        values.push(id);
        await connection.execute(
          `UPDATE courses SET ${fields.join(', ')} WHERE id = ?`,
          values
        );
      }

      // Update categories
      if (categories !== undefined) {
        await connection.execute('DELETE FROM course_categories WHERE course_id = ?', [id]);
        for (const categoryId of categories) {
          await connection.execute(
            'INSERT INTO course_categories (course_id, category_id) VALUES (?, ?)',
            [id, categoryId]
          );
        }
      }

      await connection.commit();
      return this.findById(id);
    } catch (error) {
      await connection.rollback();
      throw error;
    } finally {
      connection.release();
    }
  }

  static async delete(id) {
    const [result] = await pool.execute('DELETE FROM courses WHERE id = ?', [id]);
    return result.affectedRows > 0;
  }

  static async getStats() {
    const [result] = await pool.execute(`
      SELECT 
        COUNT(*) as total,
        SUM(CASE WHEN status = 'published' THEN 1 ELSE 0 END) as published,
        SUM(CASE WHEN status = 'draft' THEN 1 ELSE 0 END) as draft
      FROM courses
    `);
    return result[0];
  }
}

module.exports = CourseModel;
