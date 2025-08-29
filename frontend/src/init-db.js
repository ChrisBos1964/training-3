import sqlite3 from 'sqlite3';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const dbPath = join(__dirname, '..', 'training.db');

// Create database connection with explicit read-write mode
const db = new sqlite3.Database(dbPath, sqlite3.OPEN_READWRITE | sqlite3.OPEN_CREATE, (err) => {
  if (err) {
    console.error('Error opening database:', err.message);
    process.exit(1);
  }
  console.log('Connected to SQLite database in read-write mode.');
});

// Create training sessions table
const createTable = `
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

// Insert sample data
const insertSampleData = `
  INSERT OR IGNORE INTO training_sessions (title, description, status, duration) VALUES
    ('Introduction to Playwright', 'Learn the basics of Playwright testing framework', 'Completed', 2.0),
    ('Writing Test Cases', 'Master the art of writing effective test cases', 'In Progress', 3.0),
    ('Advanced Testing Techniques', 'Explore advanced testing strategies and patterns', 'Pending', 4.0),
    ('Test Automation Best Practices', 'Learn industry best practices for test automation', 'Pending', 3.5),
    ('Performance Testing', 'Understand performance testing fundamentals', 'Pending', 2.5)
`;

// Create table and insert sample data
db.serialize(() => {
  db.run(createTable, (err) => {
    if (err) {
      console.error('Error creating table:', err.message);
    } else {
      console.log('Training sessions table created successfully.');
      
      // Insert sample data
      db.run(insertSampleData, (err) => {
        if (err) {
          console.error('Error inserting sample data:', err.message);
        } else {
          console.log('Sample data inserted successfully.');
        }
        
        // Close database connection
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
