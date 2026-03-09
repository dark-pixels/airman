/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
exports.up = async function (knex) {
  // 1. Users table
  await knex.schema.createTable('users', (t) => {
    t.uuid('id').primary().defaultTo(knex.raw('gen_random_uuid()'));
    t.string('name', 255).notNullable();
    t.string('email', 255).notNullable().unique();
    t.enu('role', ['student', 'instructor', 'admin']).notNullable();
    t.timestamps(true, true);
  });

  // 2. Courses table
  await knex.schema.createTable('courses', (t) => {
    t.uuid('id').primary().defaultTo(knex.raw('gen_random_uuid()'));
    t.string('name', 255).notNullable();
    t.string('license_type', 50).notNullable();
    t.decimal('total_required_hours', 8, 2).notNullable();
    t.timestamps(true, true);
  });

  // 3. Enrollments table
  await knex.schema.createTable('enrollments', (t) => {
    t.uuid('id').primary().defaultTo(knex.raw('gen_random_uuid()'));
    t.uuid('student_id').notNullable().references('id').inTable('users').onDelete('RESTRICT');
    t.uuid('course_id').notNullable().references('id').inTable('courses').onDelete('RESTRICT');
    t.date('start_date').notNullable();
    t.enu('status', ['active', 'completed', 'dropped']).notNullable().defaultTo('active');
    t.timestamps(true, true);
  });

  // 4. EPR Records table
  await knex.schema.createTable('epr_records', (t) => {
    t.uuid('id').primary().defaultTo(knex.raw('gen_random_uuid()'));
    t.uuid('person_id').notNullable().references('id').inTable('users').onDelete('RESTRICT');
    t.uuid('evaluator_id').notNullable().references('id').inTable('users').onDelete('RESTRICT');
    t.enu('role_type', ['student', 'instructor']).notNullable();
    t.date('period_start').notNullable();
    t.date('period_end').notNullable();
    t.integer('overall_rating').notNullable().checkBetween([1, 5]);
    t.integer('technical_skills_rating').notNullable().checkBetween([1, 5]);
    t.integer('non_technical_skills_rating').notNullable().checkBetween([1, 5]);
    t.text('remarks');
    t.enu('status', ['draft', 'submitted', 'archived']).notNullable().defaultTo('draft');
    t.timestamps(true, true);

    // Indexes
    t.index('person_id');
    t.index('evaluator_id');
    t.index(['period_start', 'period_end']);
  });
};

/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
exports.down = async function (knex) {
  await knex.schema.dropTableIfExists('epr_records');
  await knex.schema.dropTableIfExists('enrollments');
  await knex.schema.dropTableIfExists('courses');
  await knex.schema.dropTableIfExists('users');
};
