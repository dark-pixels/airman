const express = require('express');
const router = express.Router();
const db = require('../db/db');

// ──────────────────────────────────────────────────────────────────────────────
// GET /api/epr/summary/:personId
// Must come before /:id to avoid conflict
// ──────────────────────────────────────────────────────────────────────────────
router.get('/summary/:personId', async (req, res) => {
  try {
    const { personId } = req.params;

    const person = await db('users').where('id', personId).first();
    if (!person) return res.status(404).json({ error: 'Person not found' });

    const eprs = await db('epr_records')
      .where('person_id', personId)
      .where('status', '!=', 'archived')
      .orderBy('period_start', 'desc');

    if (eprs.length === 0) {
      return res.json({
        personId,
        roleType: person.role,
        averageOverallRating: null,
        averageTechnicalRating: null,
        averageNonTechnicalRating: null,
        eprCount: 0,
        lastThreePeriods: [],
      });
    }

    const avg = (key) =>
      parseFloat(
        (eprs.reduce((sum, e) => sum + e[key], 0) / eprs.length).toFixed(2)
      );

    const lastThree = eprs.slice(0, 3).map((e) => ({
      periodLabel: formatPeriodLabel(e.period_start, e.period_end),
      overallRating: e.overall_rating,
    }));

    res.json({
      personId,
      roleType: person.role,
      averageOverallRating: avg('overall_rating'),
      averageTechnicalRating: avg('technical_skills_rating'),
      averageNonTechnicalRating: avg('non_technical_skills_rating'),
      eprCount: eprs.length,
      lastThreePeriods: lastThree,
    });
  } catch (err) {
    console.error('GET /api/epr/summary/:personId error:', err);
    res.status(500).json({ error: 'Internal server error', details: err.message });
  }
});

// ──────────────────────────────────────────────────────────────────────────────
// GET /api/epr?personId=...
// ──────────────────────────────────────────────────────────────────────────────
router.get('/', async (req, res) => {
  try {
    const { personId } = req.query;

    if (!personId) {
      return res.status(400).json({ error: 'personId query param is required' });
    }

    const eprs = await db('epr_records as e')
      .join('users as evaluator', 'e.evaluator_id', 'evaluator.id')
      .where('e.person_id', personId)
      .select(
        'e.id',
        'e.person_id',
        'e.evaluator_id',
        'evaluator.name as evaluator_name',
        'e.role_type',
        'e.period_start',
        'e.period_end',
        'e.overall_rating',
        'e.technical_skills_rating',
        'e.non_technical_skills_rating',
        'e.remarks',
        'e.status',
        'e.created_at',
        'e.updated_at'
      )
      .orderBy('e.period_start', 'desc');

    res.json({ data: eprs });
  } catch (err) {
    console.error('GET /api/epr error:', err);
    res.status(500).json({ error: 'Internal server error', details: err.message });
  }
});

// ──────────────────────────────────────────────────────────────────────────────
// GET /api/epr/:id
// ──────────────────────────────────────────────────────────────────────────────
router.get('/:id', async (req, res) => {
  try {
    const epr = await db('epr_records as e')
      .join('users as person', 'e.person_id', 'person.id')
      .join('users as evaluator', 'e.evaluator_id', 'evaluator.id')
      .where('e.id', req.params.id)
      .select(
        'e.*',
        'person.name as person_name',
        'person.email as person_email',
        'evaluator.name as evaluator_name',
        'evaluator.email as evaluator_email'
      )
      .first();

    if (!epr) return res.status(404).json({ error: 'EPR record not found' });

    res.json({ data: epr });
  } catch (err) {
    console.error('GET /api/epr/:id error:', err);
    res.status(500).json({ error: 'Internal server error', details: err.message });
  }
});

// ──────────────────────────────────────────────────────────────────────────────
// POST /api/epr
// ──────────────────────────────────────────────────────────────────────────────
router.post('/', async (req, res) => {
  try {
    const {
      personId,
      evaluatorId,
      roleType,
      periodStart,
      periodEnd,
      overallRating,
      technicalSkillsRating,
      nonTechnicalSkillsRating,
      remarks,
      status = 'draft',
    } = req.body;

    // Validate required fields
    const required = { personId, evaluatorId, roleType, periodStart, periodEnd, overallRating, technicalSkillsRating, nonTechnicalSkillsRating };
    for (const [key, val] of Object.entries(required)) {
      if (val === undefined || val === null || val === '') {
        return res.status(400).json({ error: `Missing required field: ${key}` });
      }
    }

    // Validate ratings
    for (const [key, val] of Object.entries({ overallRating, technicalSkillsRating, nonTechnicalSkillsRating })) {
      const num = parseInt(val, 10);
      if (isNaN(num) || num < 1 || num > 5) {
        return res.status(400).json({ error: `${key} must be between 1 and 5` });
      }
    }

    // Validate periodEnd >= periodStart
    if (new Date(periodEnd) < new Date(periodStart)) {
      return res.status(400).json({ error: 'periodEnd must be >= periodStart' });
    }

    // Validate personId and evaluatorId exist
    const [personExists, evaluatorExists] = await Promise.all([
      db('users').where('id', personId).first(),
      db('users').where('id', evaluatorId).first(),
    ]);

    if (!personExists) return res.status(400).json({ error: 'personId does not exist' });
    if (!evaluatorExists) return res.status(400).json({ error: 'evaluatorId does not exist' });

    if (!['student', 'instructor'].includes(roleType)) {
      return res.status(400).json({ error: 'roleType must be "student" or "instructor"' });
    }

    if (!['draft', 'submitted', 'archived'].includes(status)) {
      return res.status(400).json({ error: 'status must be draft, submitted, or archived' });
    }

    const [newEpr] = await db('epr_records')
      .insert({
        person_id: personId,
        evaluator_id: evaluatorId,
        role_type: roleType,
        period_start: periodStart,
        period_end: periodEnd,
        overall_rating: parseInt(overallRating, 10),
        technical_skills_rating: parseInt(technicalSkillsRating, 10),
        non_technical_skills_rating: parseInt(nonTechnicalSkillsRating, 10),
        remarks: remarks || null,
        status,
      })
      .returning('*');

    res.status(201).json({ data: newEpr });
  } catch (err) {
    console.error('POST /api/epr error:', err);
    res.status(500).json({ error: 'Internal server error', details: err.message });
  }
});

// ──────────────────────────────────────────────────────────────────────────────
// PATCH /api/epr/:id
// ──────────────────────────────────────────────────────────────────────────────
router.patch('/:id', async (req, res) => {
  try {
    const { id } = req.params;

    const existing = await db('epr_records').where('id', id).first();
    if (!existing) return res.status(404).json({ error: 'EPR record not found' });

    const allowed = ['overall_rating', 'technical_skills_rating', 'non_technical_skills_rating', 'remarks', 'status'];
    const body = req.body;

    // Map camelCase to snake_case
    const camelToSnake = {
      overallRating: 'overall_rating',
      technicalSkillsRating: 'technical_skills_rating',
      nonTechnicalSkillsRating: 'non_technical_skills_rating',
      remarks: 'remarks',
      status: 'status',
    };

    const updates = {};
    for (const [camel, snake] of Object.entries(camelToSnake)) {
      if (body[camel] !== undefined) updates[snake] = body[camel];
      if (body[snake] !== undefined) updates[snake] = body[snake];
    }

    // Validate ratings if provided
    for (const key of ['overall_rating', 'technical_skills_rating', 'non_technical_skills_rating']) {
      if (updates[key] !== undefined) {
        const num = parseInt(updates[key], 10);
        if (isNaN(num) || num < 1 || num > 5) {
          return res.status(400).json({ error: `${key} must be between 1 and 5` });
        }
        updates[key] = num;
      }
    }

    if (updates.status && !['draft', 'submitted', 'archived'].includes(updates.status)) {
      return res.status(400).json({ error: 'status must be draft, submitted, or archived' });
    }

    if (Object.keys(updates).length === 0) {
      return res.status(400).json({ error: 'No valid fields provided for update' });
    }

    updates.updated_at = db.fn.now();

    const [updated] = await db('epr_records').where('id', id).update(updates).returning('*');
    res.json({ data: updated });
  } catch (err) {
    console.error('PATCH /api/epr/:id error:', err);
    res.status(500).json({ error: 'Internal server error', details: err.message });
  }
});

// ──────────────────────────────────────────────────────────────────────────────
// Helpers
// ──────────────────────────────────────────────────────────────────────────────
function formatPeriodLabel(start, end) {
  const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
  const s = new Date(start);
  const e = new Date(end);
  const sYear = s.getFullYear();
  const eYear = e.getFullYear();

  // Try to detect quarters
  const startMonth = s.getMonth(); // 0-indexed
  const endMonth = e.getMonth();

  if (startMonth === 0 && endMonth === 2) return `Q1 ${sYear}`;
  if (startMonth === 3 && endMonth === 5) return `Q2 ${sYear}`;
  if (startMonth === 6 && endMonth === 8) return `Q3 ${sYear}`;
  if (startMonth === 9 && endMonth === 11) return `Q4 ${sYear}`;

  return `${months[startMonth]} ${sYear} – ${months[endMonth]} ${eYear}`;
}

module.exports = router;
