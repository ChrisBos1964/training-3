import sqlite3 from 'sqlite3';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const dbPath = join(__dirname, '..', 'training.db');

class DatabaseService {
  constructor() {
    this.db = null;
  }

  // Initialize database connection
  async connect() {
    return new Promise((resolve, reject) => {
      this.db = new sqlite3.Database(dbPath, (err) => {
        if (err) {
          reject(err);
        } else {
          resolve();
        }
      });
    });
  }

  // Close database connection
  async close() {
    return new Promise((resolve, reject) => {
      if (this.db) {
        this.db.close((err) => {
          if (err) {
            reject(err);
          } else {
            resolve();
          }
        });
      } else {
        resolve();
      }
    });
  }

  // Get all training sessions
  async getAllSessions() {
    return new Promise((resolve, reject) => {
      const query = 'SELECT * FROM training_sessions ORDER BY created_at DESC';
      this.db.all(query, [], (err, rows) => {
        if (err) {
          reject(err);
        } else {
          resolve(rows);
        }
      });
    });
  }

  // Get training session by ID
  async getSessionById(id) {
    return new Promise((resolve, reject) => {
      const query = 'SELECT * FROM training_sessions WHERE id = ?';
      this.db.get(query, [id], (err, row) => {
        if (err) {
          reject(err);
        } else {
          resolve(row);
        }
      });
    });
  }

  // Create new training session
  async createSession(sessionData) {
    return new Promise((resolve, reject) => {
      const { title, description, status, duration } = sessionData;
      const query = `
        INSERT INTO training_sessions (title, description, status, duration)
        VALUES (?, ?, ?, ?)
      `;
      
      this.db.run(query, [title, description, status, duration], function(err) {
        if (err) {
          reject(err);
        } else {
          resolve({
            id: this.lastID,
            title,
            description,
            status,
            duration,
            created_at: new Date().toISOString(),
            updated_at: new Date().toISOString()
          });
        }
      });
    });
  }

  // Update training session
  async updateSession(id, sessionData) {
    return new Promise((resolve, reject) => {
      const { title, description, status, duration } = sessionData;
      const query = `
        UPDATE training_sessions 
        SET title = ?, description = ?, status = ?, duration = ?, updated_at = CURRENT_TIMESTAMP
        WHERE id = ?
      `;
      
      this.db.run(query, [title, description, status, duration, id], function(err) {
        if (err) {
          reject(err);
        } else {
          if (this.changes > 0) {
            resolve({ id, title, description, status, duration });
          } else {
            reject(new Error('Session not found'));
          }
        }
      });
    });
  }

  // Delete training session
  async deleteSession(id) {
    return new Promise((resolve, reject) => {
      const query = 'DELETE FROM training_sessions WHERE id = ?';
      this.db.run(query, [id], function(err) {
        if (err) {
          reject(err);
        } else {
          if (this.changes > 0) {
            resolve({ deleted: true, id });
          } else {
            reject(new Error('Session not found'));
          }
        }
      });
    });
  }
}

export default DatabaseService;
