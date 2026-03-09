require('dotenv').config({ path: require('path').join(__dirname, '../../../.env') });

process.env.NODE_TLS_REJECT_UNAUTHORIZED = '0';

const knex = require('knex')({
  client: 'pg',
  connection: {
    connectionString: process.env.DATABASE_URL,
    ssl: { rejectUnauthorized: false },
  },
});

module.exports = knex;

