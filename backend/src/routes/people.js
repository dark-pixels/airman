const express = require('express');
const router = express.Router();
const db = require('../db/db');

/**
 * GET /api/people
 * Query params: role (optional), search (optional)
 */
router.get('/', async (req, res) => {
  try {
    const { role, search } = req.query;

    let query = db('users').select(
      'users.id',
      'users.name',
      'users.email',
      'users.role',
      'users.created_at'
    );

    if (role && ['student', 'instructor', 'admin'].includes(role)) {
      query = query.where('users.role', role);
    }

    if (search) {
      query = query.where(function () {
        this.whereILike('users.name', `%${search}%`).orWhereILike('users.email', `%${search}%`);
      });
    }

    const people = await query.orderBy('users.name', 'asc');

    // Enrich with role-specific data
    const enriched = await Promise.all(
      people.map(async (person) => {
        if (person.role === 'student') {
          // Fetch latest enrollment
          const enrollment = await db('enrollments')
            .join('courses', 'enrollments.course_id', 'courses.id')
            .where('enrollments.student_id', person.id)
            .select('courses.name as course_name', 'enrollments.status')
            .orderBy('enrollments.created_at', 'desc')
            .first();

          return {
            ...person,
            course_name: enrollment?.course_name || null,
            enrollment_status: enrollment?.status || null,
          };
        } else if (person.role === 'instructor') {
          const [{ count }] = await db('epr_records')
            .where('evaluator_id', person.id)
            .count('id as count');

          return {
            ...person,
            total_eprs_written: parseInt(count, 10),
          };
        }
        return person;
      })
    );

    res.json({ data: enriched });
  } catch (err) {
    console.error('GET /api/people error:', err);
    res.status(500).json({ error: 'Internal server error', details: err.message });
  }
});

module.exports = router;
