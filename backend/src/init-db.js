import sqlite3 from 'sqlite3';
import bcrypt from 'bcryptjs';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const dbPath = join(__dirname, '..', 'training.db');

// Create database connection
const db = new sqlite3.Database(dbPath, (err) => {
  if (err) {
    console.error('Error opening database:', err.message);
    process.exit(1);
  }
  console.log('Connected to SQLite database.');
});

// Create training sessions table
const createSessionsTable = `
  CREATE TABLE IF NOT EXISTS training_sessions (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    title TEXT NOT NULL,
    description TEXT NOT NULL,
    status TEXT NOT NULL CHECK(status IN ('Pending', 'In Progress', 'Completed')),
    duration REAL,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
  )
`;

// Create users table
const createUsersTable = `
  CREATE TABLE IF NOT EXISTS users (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    username TEXT UNIQUE NOT NULL,
    email TEXT UNIQUE,
    password_hash TEXT,
    provider TEXT DEFAULT 'local',
    external_id TEXT,
    avatar_url TEXT,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
  )
`;

// Insert sample data
const insertSampleData = `
  INSERT OR IGNORE INTO training_sessions (title, description, status, duration) VALUES
    ('Introduction to Playwright', 'Learn the basics of Playwright testing framework', 'Completed', 2.0),
    ('Writing Test Cases', 'Master the art of writing effective test cases', 'In Progress', 3.0),
    ('Advanced Testing Techniques', 'Explore advanced testing strategies and patterns', 'Pending', 4.0),
    ('Test Automation Best Practices', 'Learn industry best practices for test automation', 'Pending', 3.5),
    ('Performance Testing', 'Understand performance testing fundamentals', 'Pending', 2.5),
    ('API Testing Fundamentals', 'Learn how to test REST APIs effectively', 'In Progress', 3.0),
    ('UI Testing Strategies', 'Master user interface testing approaches', 'Completed', 2.5),
    ('Test Data Management', 'Learn best practices for managing test data', 'Pending', 2.0),
    ('Continuous Integration Testing', 'Integrate testing into CI/CD pipelines', 'In Progress', 4.0),
    ('Mobile Testing Basics', 'Introduction to mobile application testing', 'Pending', 3.0),
    ('Test Reporting and Analytics', 'Create comprehensive test reports and analyze results', 'Completed', 2.5)
`;

// Create tables and insert sample data
db.serialize(async () => {
  // Create training sessions table
  db.run(createSessionsTable, (err) => {
    if (err) {
      console.error('Error creating training sessions table:', err.message);
    } else {
      console.log('Training sessions table created successfully.');
    }
  });

  // Create users table
  db.run(createUsersTable, (err) => {
    if (err) {
      console.error('Error creating users table:', err.message);
    } else {
      console.log('Users table created successfully.');
    }
  });

  // Insert sample training sessions data
  db.run(insertSampleData, (err) => {
    if (err) {
      console.error('Error inserting sample data:', err.message);
    } else {
      console.log('Sample training sessions data inserted successfully.');
    }
  });

  // Insert user data (joel/grimberg)
  const hashedPassword = await bcrypt.hash('grimberg', 10);
  // Fallback-compatible upsert: try update first, if no row updated then insert
  const updateSql = 'UPDATE users SET password_hash = ?, updated_at = CURRENT_TIMESTAMP WHERE username = ?';
  const insertSql = 'INSERT INTO users (username, password_hash, provider) VALUES (?, ?, ?)';

  db.run(updateSql, [hashedPassword, 'joel'], function(updateErr) {
    if (updateErr) {
      console.error('Error updating user password:', updateErr.message);
    }

    if (this && this.changes > 0) {
      console.log('User password updated successfully (joel/grimberg).');
      // Close DB
      db.close((err) => {
        if (err) {
          console.error('Error closing database:', err.message);
        } else {
          console.log('Database connection closed.');
          console.log('Database initialization completed successfully!');
        }
      });
    } else {
      db.run(insertSql, ['joel', hashedPassword, 'local'], function(insertErr) {
        if (insertErr) {
          console.error('Error inserting user data:', insertErr.message);
        } else {
          console.log('User inserted successfully (joel/grimberg).');
        }
        db.close((err) => {
          if (err) {
            console.error('Error closing database:', err.message);
          } else {
            console.log('Database connection closed.');
            console.log('Database initialization completed successfully!');
          }
        });
      });
    }
  });
});
