import express from 'express';
import cors from 'cors';
import bodyParser from 'body-parser';
import DatabaseService from './database.js';

const app = express();
const PORT = process.env.PORT || 3001;

// Middleware
app.use(cors());
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

// Initialize database service
const dbService = new DatabaseService();

// Connect to database on startup
dbService.connect().catch(console.error);

// Health check endpoint
app.get('/health', (req, res) => {
  res.json({ status: 'OK', message: 'Training Sessions API is running' });
});

// Get all training sessions
app.get('/api/sessions', async (req, res) => {
  try {
    const sessions = await dbService.getAllSessions();
    res.json(sessions);
  } catch (error) {
    console.error('Error fetching sessions:', error);
    res.status(500).json({ error: 'Failed to fetch training sessions' });
  }
});

// Get training session by ID
app.get('/api/sessions/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const session = await dbService.getSessionById(id);
    
    if (!session) {
      return res.status(404).json({ error: 'Training session not found' });
    }
    
    res.json(session);
  } catch (error) {
    console.error('Error fetching session:', error);
    res.status(500).json({ error: 'Failed to fetch training session' });
  }
});

// Create new training session
app.post('/api/sessions', async (req, res) => {
  try {
    const { title, description, status, duration } = req.body;
    
    // Validation
    if (!title || !description || !status) {
      return res.status(400).json({ 
        error: 'Title, description, and status are required' 
      });
    }
    
    if (!['Pending', 'In Progress', 'Completed'].includes(status)) {
      return res.status(400).json({ 
        error: 'Status must be one of: Pending, In Progress, Completed' 
      });
    }
    
    const newSession = await dbService.createSession({
      title,
      description,
      status,
      duration: duration || null
    });
    
    res.status(201).json(newSession);
  } catch (error) {
    console.error('Error creating session:', error);
    res.status(500).json({ error: 'Failed to create training session' });
  }
});

// Update training session
app.put('/api/sessions/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const { title, description, status, duration } = req.body;
    
    // Validation
    if (!title || !description || !status) {
      return res.status(400).json({ 
        error: 'Title, description, and status are required' 
      });
    }
    
    if (!['Pending', 'In Progress', 'Completed'].includes(status)) {
      return res.status(400).json({ 
        error: 'Status must be one of: Pending, In Progress, Completed' 
      });
    }
    
    const updatedSession = await dbService.updateSession(id, {
      title,
      description,
      status,
      duration: duration || null
    });
    
    res.json(updatedSession);
  } catch (error) {
    console.error('Error updating session:', error);
    if (error.message === 'Session not found') {
      res.status(404).json({ error: 'Training session not found' });
    } else {
      res.status(500).json({ error: 'Failed to update training session' });
    }
  }
});

// Delete training session
app.delete('/api/sessions/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const result = await dbService.deleteSession(id);
    
    res.json(result);
  } catch (error) {
    console.error('Error deleting session:', error);
    if (error.message === 'Session not found') {
      res.status(404).json({ error: 'Training session not found' });
    } else {
      res.status(500).json({ error: 'Failed to delete training session' });
    }
  }
});

// Graceful shutdown
process.on('SIGINT', async () => {
  console.log('Shutting down gracefully...');
  await dbService.close();
  process.exit(0);
});

process.on('SIGTERM', async () => {
  console.log('Shutting down gracefully...');
  await dbService.close();
  process.exit(0);
});

// Start server
app.listen(PORT, () => {
  console.log(`Training Sessions API server running on port ${PORT}`);
  console.log(`Health check: http://localhost:${PORT}/health`);
});
