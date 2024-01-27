const { Pool } = require('pg');

const pool = new Pool({
  user: 'postgres',
  host: 'localhost',
  database: 'blogdatabase',
  password: 't123',
  port: 5432,
});

module.exports = pool;

// cloud.elastic.co giriş bilgileri:

// xaxew48869@wuzak.com
// Conquerer123456789 