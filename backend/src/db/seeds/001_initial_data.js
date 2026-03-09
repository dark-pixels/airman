const { v4: uuidv4 } = require('crypto');

// Helper to generate UUID
const uid = () => require('crypto').randomUUID();

/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
exports.seed = async function (knex) {
  // Clear existing data in correct order
  await knex('epr_records').del();
  await knex('enrollments').del();
  await knex('courses').del();
  await knex('users').del();

  // ── ADMIN ──────────────────────────────────────────────────────────────────
  const adminId = uid();
  await knex('users').insert({
    id: adminId,
    name: 'Murugan Subramanian',
    email: 'murugan@airman.com',
    role: 'admin',
  });

  // ── INSTRUCTORS ────────────────────────────────────────────────────────────
  const inst1Id = uid();
  const inst2Id = uid();
  const inst3Id = uid();

  await knex('users').insert([
    { id: inst1Id, name: 'Rama Krishnan',  email: 'rama@airman.com',    role: 'instructor' },
    { id: inst2Id, name: 'Karthik Selvam', email: 'karthik@airman.com', role: 'instructor' },
    { id: inst3Id, name: 'Venkat Rajan',   email: 'venkat@airman.com',  role: 'instructor' },
  ]);

  // ── STUDENTS ───────────────────────────────────────────────────────────────
  const students = [];
  const studentData = [
    { name: 'Gokul Murugesan',  email: 'gokul@airman.com'     },
    { name: 'Seetha Lakshmi',   email: 'seetha@airman.com'    },
    { name: 'Arjun Pandian',    email: 'arjun@airman.com'     },
    { name: 'Kavitha Rajan',    email: 'kavitha@airman.com'   },
    { name: 'Dhinesh Kumar',    email: 'dhinesh@airman.com'   },
    { name: 'Priya Sundaram',   email: 'priya@airman.com'     },
    { name: 'Surya Prakash',    email: 'surya@airman.com'     },
    { name: 'Meenakshi Pillai', email: 'meenakshi@airman.com' },
  ];

  for (const s of studentData) {
    const id = uid();
    students.push({ id, ...s, role: 'student' });
  }
  await knex('users').insert(students);

  // ── COURSES ────────────────────────────────────────────────────────────────
  const course1Id = uid();
  const course2Id = uid();

  await knex('courses').insert([
    { id: course1Id, name: 'PPL Ground School', license_type: 'PPL', total_required_hours: 150 },
    { id: course2Id, name: 'CPL Integrated',    license_type: 'CPL', total_required_hours: 250 },
  ]);

  // ── ENROLLMENTS ────────────────────────────────────────────────────────────
  const enrollments = [
    { student_id: students[0].id, course_id: course1Id, start_date: '2024-01-15', status: 'active'    },
    { student_id: students[1].id, course_id: course1Id, start_date: '2024-01-15', status: 'active'    },
    { student_id: students[2].id, course_id: course2Id, start_date: '2024-02-01', status: 'active'    },
    { student_id: students[3].id, course_id: course2Id, start_date: '2024-02-01', status: 'completed' },
    { student_id: students[4].id, course_id: course1Id, start_date: '2024-03-10', status: 'active'    },
    { student_id: students[5].id, course_id: course2Id, start_date: '2024-03-10', status: 'dropped'   },
    { student_id: students[6].id, course_id: course1Id, start_date: '2024-04-01', status: 'active'    },
    { student_id: students[7].id, course_id: course2Id, start_date: '2024-04-01', status: 'active'    },
  ];

  for (const e of enrollments) {
    await knex('enrollments').insert({ id: uid(), ...e });
  }

  // ── EPR RECORDS ────────────────────────────────────────────────────────────
  const eprs = [
    // ── Student EPRs – Gokul ──
    {
      person_id: students[0].id, evaluator_id: inst1Id, role_type: 'student',
      period_start: '2024-01-01', period_end: '2024-03-31',
      overall_rating: 4, technical_skills_rating: 4, non_technical_skills_rating: 3,
      remarks: 'Gokul demonstrates strong theoretical knowledge and quick analytical skills. Needs improvement on CRM and checklist discipline during multi-crew exercises.',
      status: 'submitted',
    },
    {
      person_id: students[0].id, evaluator_id: inst2Id, role_type: 'student',
      period_start: '2024-04-01', period_end: '2024-06-30',
      overall_rating: 5, technical_skills_rating: 5, non_technical_skills_rating: 4,
      remarks: "Excellent progress this quarter. Gokul's navigation skills and instrument proficiency have significantly improved. Ready for advanced PPL modules.",
      status: 'submitted',
    },
    {
      person_id: students[0].id, evaluator_id: inst1Id, role_type: 'student',
      period_start: '2024-07-01', period_end: '2024-09-30',
      overall_rating: 4, technical_skills_rating: 4, non_technical_skills_rating: 5,
      remarks: 'CRM skills have drastically improved. Gokul shows exceptional situational awareness. Recommended for CPL phase transition.',
      status: 'draft',
    },
    // ── Student EPRs – Seetha ──
    {
      person_id: students[1].id, evaluator_id: inst1Id, role_type: 'student',
      period_start: '2024-01-01', period_end: '2024-03-31',
      overall_rating: 3, technical_skills_rating: 3, non_technical_skills_rating: 4,
      remarks: 'Seetha is diligent and disciplined. Requires more simulator hours on IFR approaches before solo clearance.',
      status: 'submitted',
    },
    {
      person_id: students[1].id, evaluator_id: inst3Id, role_type: 'student',
      period_start: '2024-04-01', period_end: '2024-06-30',
      overall_rating: 4, technical_skills_rating: 4, non_technical_skills_rating: 4,
      remarks: 'Consistent improvement noted. Good situational awareness demonstrated during cross-country navigation exercises.',
      status: 'submitted',
    },
    // ── Student EPR – Arjun ──
    {
      person_id: students[2].id, evaluator_id: inst2Id, role_type: 'student',
      period_start: '2024-02-01', period_end: '2024-04-30',
      overall_rating: 5, technical_skills_rating: 5, non_technical_skills_rating: 5,
      remarks: 'Outstanding performance. Arjun shows exceptional aptitude for the CPL track. Highest scorer in the ground examination this batch.',
      status: 'submitted',
    },
    // ── Instructor EPRs ──
    {
      person_id: inst1Id, evaluator_id: adminId, role_type: 'instructor',
      period_start: '2024-01-01', period_end: '2024-06-30',
      overall_rating: 5, technical_skills_rating: 5, non_technical_skills_rating: 5,
      remarks: 'Rama Krishnan continues to be an exemplary instructor. Student pass rates are outstanding and his ground briefings receive top feedback scores.',
      status: 'submitted',
    },
    {
      person_id: inst2Id, evaluator_id: adminId, role_type: 'instructor',
      period_start: '2024-01-01', period_end: '2024-06-30',
      overall_rating: 4, technical_skills_rating: 4, non_technical_skills_rating: 5,
      remarks: 'Karthik Selvam demonstrates excellent communication and mentorship skills. Students consistently rate his debrief sessions as highly effective.',
      status: 'submitted',
    },
    {
      person_id: inst3Id, evaluator_id: adminId, role_type: 'instructor',
      period_start: '2024-01-01', period_end: '2024-06-30',
      overall_rating: 4, technical_skills_rating: 5, non_technical_skills_rating: 3,
      remarks: 'Strong technical instructor. Encouraged to focus more on soft skills during ground briefings.',
      status: 'draft',
    },
  ];

  for (const epr of eprs) {
    await knex('epr_records').insert({ id: uid(), ...epr });
  }

  console.log('✅ Seed completed successfully!');
};
