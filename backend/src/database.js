import sqlite3 from 'sqlite3';
import bcrypt from 'bcryptjs';
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

  // Get user by username
  async getUserByUsername(username) {
    return new Promise((resolve, reject) => {
      const query = 'SELECT * FROM users WHERE username = ?';
      this.db.get(query, [username], (err, row) => {
        if (err) {
          reject(err);
        } else {
          resolve(row);
        }
      });
    });
  }

  // Verify user credentials
  async verifyUser(username, password) {
    try {
      const user = await this.getUserByUsername(username);
      if (!user || !user.password_hash) {
        return null;
      }
      
      const isValid = await bcrypt.compare(password, user.password_hash);
      if (isValid) {
        return { id: user.id, username: user.username, email: user.email };
      }
      return null;
    } catch (error) {
      throw error;
    }
  }

  // Update user password
  async updateUserPassword(userId, hashedPassword) {
    return new Promise((resolve, reject) => {
      const query = `
        UPDATE users 
        SET password_hash = ?, updated_at = CURRENT_TIMESTAMP
        WHERE id = ?
      `;
      
      this.db.run(query, [hashedPassword, userId], function(err) {
        if (err) {
          reject(err);
        } else {
          resolve({ changes: this.changes });
        }
      });
    });
  }

  // Update user avatar
  async updateUserAvatar(userId, avatarUrl) {
    return new Promise((resolve, reject) => {
      const query = `
        UPDATE users 
        SET avatar_url = ?, updated_at = CURRENT_TIMESTAMP
        WHERE id = ?
      `;
      
      this.db.run(query, [avatarUrl, userId], function(err) {
        if (err) {
          reject(err);
        } else {
          resolve({ changes: this.changes });
        }
      });
    });
  }

  // Get user by email
  async getUserByEmail(email) {
    return new Promise((resolve, reject) => {
      const query = 'SELECT * FROM users WHERE email = ?';
      this.db.get(query, [email], (err, row) => {
        if (err) {
          reject(err);
        } else {
          resolve(row);
        }
      });
    });
  }

  // Create new user (local auth)
  async createUser(username, hashedPassword) {
    return new Promise((resolve, reject) => {
      const query = `
        INSERT INTO users (username, password_hash, provider, created_at, updated_at)
        VALUES (?, ?, 'local', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP)
      `;
      
      this.db.run(query, [username, hashedPassword], function(err) {
        if (err) {
          reject(err);
        } else {
          resolve({
            id: this.lastID,
            username: username,
            provider: 'local',
            created_at: new Date().toISOString(),
            updated_at: new Date().toISOString()
          });
        }
      });
    });
  }

  // Create SSO user
  async createSSOUser({ username, email, provider, external_id, avatar_url }) {
    return new Promise((resolve, reject) => {
      const query = `
        INSERT INTO users (username, email, provider, external_id, avatar_url, created_at, updated_at)
        VALUES (?, ?, ?, ?, ?, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP)
      `;
      
      this.db.run(query, [username, email, provider, external_id, avatar_url], function(err) {
        if (err) {
          reject(err);
        } else {
          resolve({
            id: this.lastID,
            username: username,
            email: email,
            provider: provider,
            external_id: external_id,
            avatar_url: avatar_url,
            created_at: new Date().toISOString(),
            updated_at: new Date().toISOString()
          });
        }
      });
    });
  }

  // Get all users (for SSO lookup)
  async getAllUsers() {
    return new Promise((resolve, reject) => {
      const query = 'SELECT * FROM users';
      this.db.all(query, [], (err, rows) => {
        if (err) {
          reject(err);
        } else {
          resolve(rows);
        }
      });
    });
  }
}

export default DatabaseService;
