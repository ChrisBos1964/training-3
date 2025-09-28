import sqlite3 from 'sqlite3';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const dbPath = join(__dirname, 'training.db');

console.log('Starting database migration...');

const db = new sqlite3.Database(dbPath, (err) => {
  if (err) {
    console.error('Error opening database:', err.message);
    process.exit(1);
  }
  console.log('Connected to SQLite database.');
});

// Create new users table with SSO support
const createNewUsersTable = `
  CREATE TABLE IF NOT EXISTS users_new (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    username TEXT UNIQUE NOT NULL,
    email TEXT UNIQUE,
    password_hash TEXT,
    provider TEXT DEFAULT 'local',
    external_id TEXT,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
  )
`;

// Migrate data from old table to new table
const migrateData = `
  INSERT INTO users_new (id, username, password_hash, provider, created_at, updated_at)
  SELECT id, username, password_hash, 'local', created_at, updated_at FROM users
`;

// Drop old table and rename new table
const finalizeMigration = `
  DROP TABLE users;
  ALTER TABLE users_new RENAME TO users;
`;

db.serialize(() => {
  // Create new table
  db.run(createNewUsersTable, (err) => {
    if (err) {
      console.error('Error creating new users table:', err.message);
    } else {
      console.log('New users table created successfully.');
    }
  });

  // Migrate data
  db.run(migrateData, (err) => {
    if (err) {
      console.error('Error migrating data:', err.message);
    } else {
      console.log('Data migrated successfully.');
    }
  });

  // Finalize migration
  db.run(finalizeMigration, (err) => {
    if (err) {
      console.error('Error finalizing migration:', err.message);
    } else {
      console.log('Migration completed successfully!');
    }
    
    // Close database
    db.close((err) => {
      if (err) {
        console.error('Error closing database:', err.message);
      } else {
        console.log('Database connection closed.');
        console.log('Database migration completed successfully!');
        process.exit(0);
      }
    });
  });
});
