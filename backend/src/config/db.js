const { Pool } = require('pg');
const fs = require('fs');
const path = require('path');
const dotenv = require('dotenv');

dotenv.config();

let pool = null;
let sqliteDb = null;
let dbDriver = 'postgres'; // 'postgres' or 'sqlite'

/**
 * Initialize Database Connection
 */
function initDatabase() {
  const connectionString = process.env.DATABASE_URL;
  const isPostgresConfigured = !!(connectionString || process.env.PGHOST || process.env.PGDATABASE);

  // If explicit SQLite requested or no Postgres configured in local development
  if (process.env.USE_SQLITE === 'true') {
    setupSqlite();
    return;
  }

  try {
    const config = connectionString
      ? { connectionString }
      : {
          host: process.env.PGHOST || 'localhost',
          port: parseInt(process.env.PGPORT || '5432', 10),
          database: process.env.PGDATABASE || 'barangay_tinurik',
          user: process.env.PGUSER || 'postgres',
          password: process.env.PGPASSWORD || 'postgres',
        };

    pool = new Pool(config);

    // Test Postgres connection
    pool.query('SELECT 1', (err) => {
      if (err) {
        console.warn(`[DB WARNING] PostgreSQL connection failed (${err.message}).`);
        console.warn('[DB INFO] Automatically activating SQLite fallback for zero-setup local dev & testing.');
        setupSqlite();
      } else {
        dbDriver = 'postgres';
        console.log('[DB INFO] Connected to PostgreSQL database successfully.');
      }
    });
  } catch (error) {
    console.warn(`[DB WARNING] Error initializing PostgreSQL pool (${error.message}).`);
    setupSqlite();
  }
}

/**
 * Setup SQLite fallback
 */
function setupSqlite() {
  dbDriver = 'sqlite';
  const Database = require('better-sqlite3');
  const dbDir = path.resolve(__dirname, '../../database');
  if (!fs.existsSync(dbDir)) {
    fs.mkdirSync(dbDir, { recursive: true });
  }
  const dbPath = path.join(dbDir, 'tinurik.sqlite');
  sqliteDb = new Database(dbPath);
  sqliteDb.pragma('journal_mode = WAL');
  sqliteDb.pragma('foreign_keys = ON');

  // Initialize SQLite schema and initial seed if tables do not exist
  bootstrapSqlite(sqliteDb);
  console.log(`[DB INFO] Using embedded SQLite database at: ${dbPath}`);
}

/**
 * Bootstrap SQLite with identical schema and initial seed
 */
function bootstrapSqlite(db) {
  db.exec(`
    CREATE TABLE IF NOT EXISTS users (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      full_name TEXT NOT NULL,
      email TEXT UNIQUE NOT NULL,
      password_hash TEXT NOT NULL,
      address TEXT NOT NULL,
      contact_number TEXT NOT NULL,
      role TEXT NOT NULL DEFAULT 'USER' CHECK (role IN ('ADMIN', 'USER')),
      is_active INTEGER NOT NULL DEFAULT 1,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP
    );

    CREATE TABLE IF NOT EXISTS document_types (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      document_name TEXT UNIQUE NOT NULL,
      description TEXT,
      is_active INTEGER NOT NULL DEFAULT 1,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP
    );

    CREATE TABLE IF NOT EXISTS document_requests (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
      document_type_id INTEGER NOT NULL REFERENCES document_types(id) ON DELETE RESTRICT,
      full_name TEXT NOT NULL,
      address TEXT NOT NULL,
      contact_number TEXT NOT NULL,
      purpose TEXT NOT NULL,
      status TEXT NOT NULL DEFAULT 'Pending' CHECK (status IN ('Pending', 'Approved', 'Rejected', 'Completed')),
      rejection_reason TEXT,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
    );

    CREATE TABLE IF NOT EXISTS request_status_history (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      request_id INTEGER NOT NULL REFERENCES document_requests(id) ON DELETE CASCADE,
      previous_status TEXT,
      new_status TEXT NOT NULL,
      remarks TEXT,
      updated_by INTEGER REFERENCES users(id) ON DELETE SET NULL,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP
    );
  `);

  // Check if users already seeded
  const userCount = db.prepare('SELECT count(*) as count FROM users').get().count;
  if (userCount === 0) {
    const adminHash = '$2b$10$8ZlCwe7o0d..l7eaINrDxeJRhSjnCVAohjjiGDO2thS1Pw0wS5t2y'; // Admin123!
    const userHash = '$2b$10$ROH1MiNqt6rtruP10fQgJu7cOmg0ZcgFvMw34Jvk6gyQHrGLXAl56'; // User123!

    const insertUser = db.prepare(`
      INSERT INTO users (full_name, email, password_hash, address, contact_number, role, is_active)
      VALUES (?, ?, ?, ?, ?, ?, 1)
    `);

    insertUser.run('Barangay Administrator', 'admin@tinurik.gov.ph', adminHash, 'Barangay Tinurik Hall, Tanauan City, Batangas', '0917-123-4567', 'ADMIN');
    insertUser.run('Juan Dela Cruz', 'user@tinurik.gov.ph', userHash, 'Purok 3, Barangay Tinurik, Tanauan City, Batangas', '0998-765-4321', 'USER');
    insertUser.run('Maria Santos', 'maria.santos@tinurik.gov.ph', userHash, 'Purok 1, Barangay Tinurik, Tanauan City, Batangas', '0918-555-0199', 'USER');

    const insertDocType = db.prepare(`
      INSERT INTO document_types (document_name, description, is_active)
      VALUES (?, ?, 1)
    `);

    insertDocType.run('Barangay Clearance', 'Official document certifying that the resident is of good moral standing with no derogatory record in the barangay. Commonly required for employment and legal transactions.');
    insertDocType.run('Certificate of Residency', 'Proof that the applicant is a bonafide resident residing at a verified address within Barangay Tinurik, Tanauan City.');
    insertDocType.run('Certificate of Indigency', 'Official certification issued to low-income residents qualifying them for medical, educational, burial, or legal financial assistance.');
    insertDocType.run('Business Clearance', 'Mandatory barangay clearance for operating, renewing, or establishing a commercial business or trade within Barangay Tinurik jurisdiction.');
    insertDocType.run('Barangay ID', 'Official barangay government issued identification card verifying identity and residency within Barangay Tinurik.');
    insertDocType.run('Other Documents', 'Other barangay certifications, endorsements, agreements, or certifications upon request and evaluation.');

    const insertRequest = db.prepare(`
      INSERT INTO document_requests (user_id, document_type_id, full_name, address, contact_number, purpose, status, rejection_reason)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?)
    `);

    insertRequest.run(2, 1, 'Juan Dela Cruz', 'Purok 3, Barangay Tinurik, Tanauan City, Batangas', '0998-765-4321', 'Pre-employment requirement for local electronics manufacturing company.', 'Pending', null);
    insertRequest.run(2, 2, 'Juan Dela Cruz', 'Purok 3, Barangay Tinurik, Tanauan City, Batangas', '0998-765-4321', 'Bank account opening requirement at Land Bank Tanauan.', 'Approved', null);
    insertRequest.run(3, 3, 'Maria Santos', 'Purok 1, Barangay Tinurik, Tanauan City, Batangas', '0918-555-0199', 'Financial and medical assistance application at DSWD Tanauan.', 'Completed', null);

    const insertHistory = db.prepare(`
      INSERT INTO request_status_history (request_id, previous_status, new_status, remarks, updated_by)
      VALUES (?, ?, ?, ?, ?)
    `);

    insertHistory.run(1, null, 'Pending', 'Document request submitted by resident Juan Dela Cruz.', 2);
    insertHistory.run(2, null, 'Pending', 'Document request submitted by resident Juan Dela Cruz.', 2);
    insertHistory.run(2, 'Pending', 'Approved', 'Requirements verified and approved by admin. Ready for processing.', 1);
    insertHistory.run(3, null, 'Pending', 'Document request submitted by resident Maria Santos.', 3);
    insertHistory.run(3, 'Pending', 'Approved', 'Indigency assessment verified and approved by admin.', 1);
    insertHistory.run(3, 'Approved', 'Completed', 'Document printed, stamped, and issued to resident at barangay hall counter.', 1);

    console.log('[DB INFO] Initial demo records seeded into SQLite database.');
  }
}

// Initialize on require
initDatabase();

/**
 * Universal Query Execution
 * Handles $1, $2, ... parameter mapping and returns standard { rows: [...], rowCount: n }
 */
async function query(text, params = []) {
  if (dbDriver === 'postgres' && pool) {
    try {
      const res = await pool.query(text, params);
      return res;
    } catch (err) {
      // If pool connection failed during query, fallback to sqlite if available
      if (err.code === 'ECONNREFUSED' || err.code === 'ENOTFOUND') {
        console.warn('[DB FALLBACK] Postgres connection dropped. Falling back to SQLite.');
        setupSqlite();
        return querySqlite(text, params);
      }
      throw err;
    }
  }

  return querySqlite(text, params);
}

function querySqlite(text, params = []) {
  if (!sqliteDb) {
    setupSqlite();
  }

  // Convert PostgreSQL $1, $2, $3 to SQLite ?
  let paramIndex = 1;
  let sqliteQuery = text.replace(/\$(\d+)/g, () => '?');

  // Handle boolean conversions: in SQLite boolean is 1 or 0
  const normalizedParams = params.map(val => {
    if (typeof val === 'boolean') return val ? 1 : 0;
    return val;
  });

  const trimmed = sqliteQuery.trim().toUpperCase();

  try {
    if (trimmed.startsWith('SELECT') || trimmed.includes('RETURNING')) {
      const stmt = sqliteDb.prepare(sqliteQuery);
      const rows = stmt.all(...normalizedParams);
      // Map integer 1/0 back to boolean for is_active
      const mappedRows = rows.map(row => {
        if (row && typeof row.is_active === 'number') {
          return { ...row, is_active: row.is_active === 1 };
        }
        return row;
      });
      return {
        rows: mappedRows,
        rowCount: mappedRows.length
      };
    } else {
      const stmt = sqliteDb.prepare(sqliteQuery);
      const info = stmt.run(...normalizedParams);
      return {
        rows: [],
        rowCount: info.changes,
        lastInsertRowid: info.lastInsertRowid
      };
    }
  } catch (error) {
    console.error('[DB QUERY ERROR]', error.message, 'SQL:', sqliteQuery, 'Params:', normalizedParams);
    throw error;
  }
}

module.exports = {
  query,
  getDriver: () => dbDriver,
  pool,
  getSqlite: () => sqliteDb
};
