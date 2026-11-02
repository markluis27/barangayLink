/**
 * Database Initialization Script for PostgreSQL
 * Usage: node database/init-db.js
 * Runs schema.sql and seed.sql against PostgreSQL connection specified in .env
 */
const { Pool } = require('pg');
const fs = require('fs');
const path = require('path');
const dotenv = require('dotenv');

dotenv.config({ path: path.resolve(__dirname, '../.env') });

async function initPostgres() {
  const connectionString = process.env.DATABASE_URL;
  const config = connectionString
    ? { connectionString }
    : {
        host: process.env.PGHOST || 'localhost',
        port: parseInt(process.env.PGPORT || '5432', 10),
        database: process.env.PGDATABASE || 'barangay_tinurik',
        user: process.env.PGUSER || 'postgres',
        password: process.env.PGPASSWORD || 'postgres',
      };

  console.log('[INIT-DB] Connecting to PostgreSQL database...');
  const pool = new Pool(config);

  try {
    const client = await pool.connect();
    console.log('[INIT-DB] Connected successfully.');

    const schemaPath = path.join(__dirname, 'schema.sql');
    const seedPath = path.join(__dirname, 'seed.sql');

    console.log('[INIT-DB] Applying schema from schema.sql...');
    const schemaSql = fs.readFileSync(schemaPath, 'utf8');
    await client.query(schemaSql);
    console.log('[INIT-DB] Schema applied successfully.');

    console.log('[INIT-DB] Applying seed data from seed.sql...');
    const seedSql = fs.readFileSync(seedPath, 'utf8');
    await client.query(seedSql);
    console.log('[INIT-DB] Seed data inserted successfully.');

    client.release();
    await pool.end();
    console.log('[INIT-DB] Database initialization completed successfully!');
  } catch (err) {
    console.error('[INIT-DB ERROR]', err.message);
    process.exit(1);
  }
}

initPostgres();
