import sqlite3 from 'sqlite3';
import bcrypt from 'bcryptjs';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const dbPath = join(__dirname, 'training.db');

// Create database connection
const db = new sqlite3.Database(dbPath, (err) => {
  if (err) {
    console.error('Error opening database:', err.message);
    process.exit(1);
  }
  console.log('Connected to SQLite database.');
});

// Hash the new password
const newPassword = 'grimberg';
const hashedPassword = await bcrypt.hash(newPassword, 10);

console.log('New password hash:', hashedPassword);

// Update the user's password
const updatePassword = `
  UPDATE users 
  SET password_hash = ?, updated_at = CURRENT_TIMESTAMP 
  WHERE username = ?
`;

db.run(updatePassword, [hashedPassword, 'joel'], function(err) {
  if (err) {
    console.error('Error updating password:', err.message);
  } else {
    console.log(`Password updated successfully for user 'joel'. Rows changed: ${this.changes}`);
  }
  
  // Close database connection
  db.close((err) => {
    if (err) {
      console.error('Error closing database:', err.message);
    } else {
      console.log('Database connection closed.');
      console.log('Password update completed successfully!');
    }
  });
});
