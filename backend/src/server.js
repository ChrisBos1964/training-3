import 'dotenv/config';
import express from 'express';
import cors from 'cors';
import bodyParser from 'body-parser';
import jwt from 'jsonwebtoken';
import bcrypt from 'bcryptjs';
import DatabaseService from './database.js';

const app = express();
const PORT = process.env.PORT || 3001;
const JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key-change-in-production';

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

// Login endpoint
app.post('/api/login', async (req, res) => {
  try {
    const { username, password } = req.body;
    
    // Validation
    if (!username || !password) {
      return res.status(400).json({ 
        error: 'Username and password are required',
        success: false
      });
    }
    
    // Verify credentials
    const user = await dbService.verifyUser(username, password);
    
    if (!user) {
      return res.status(401).json({ 
        error: 'Invalid credentials',
        success: false
      });
    }
    
    // Generate JWT token
    const token = jwt.sign(
      { userId: user.id, username: user.username },
      JWT_SECRET,
      { expiresIn: '24h' }
    );
    
    res.json({
      success: true,
      message: 'Login successful',
      token,
      user: { id: user.id, username: user.username }
    });
  } catch (error) {
    console.error('Error during login:', error);
    res.status(500).json({ 
      error: 'Internal server error',
      success: false
    });
  }
});

// Forgot password endpoint
app.post('/api/forgot-password', async (req, res) => {
  try {
    const { username } = req.body;
    
    // Validation
    if (!username || !username.trim()) {
      return res.status(400).json({ 
        error: 'Username is required',
        success: false
      });
    }
    
    // Check if user exists
    const user = await dbService.getUserByUsername(username.trim());
    
    if (!user) {
      return res.status(404).json({ 
        error: 'User not found',
        success: false
      });
    }
    
    // Generate new password
    const newPassword = Math.random().toString(36).substring(2, 15) + Math.random().toString(36).substring(2, 15);
    
    // Hash the new password
    const hashedPassword = await bcrypt.hash(newPassword, 10);
    
    // Update user's password in database
    await dbService.updateUserPassword(user.id, hashedPassword);
    
    // Log to backend console
    console.log(`Password reset for user '${username}'. New password: ${newPassword}`);
    
    res.json({
      success: true,
      message: 'Password reset successfully',
      newPassword: newPassword
    });
  } catch (error) {
    console.error('Error during password reset:', error);
    res.status(500).json({ 
      error: 'Internal server error',
      success: false
    });
  }
});

// Create account endpoint
app.post('/api/create-account', async (req, res) => {
  try {
    const { username, password } = req.body;
    
    // Validation
    if (!username || !password) {
      return res.status(400).json({ 
        error: 'Username and password are required',
        success: false
      });
    }
    
    // Check if username already exists
    const existingUser = await dbService.getUserByUsername(username.trim());
    
    if (existingUser) {
      return res.status(409).json({ 
        error: 'Username already exists',
        success: false
      });
    }
    
    // Hash the password
    const hashedPassword = await bcrypt.hash(password, 10);
    
    // Create new user
    const newUser = await dbService.createUser(username.trim(), hashedPassword);
    
    res.status(201).json({
      success: true,
      message: 'Account created successfully',
      user: { id: newUser.id, username: newUser.username }
    });
  } catch (error) {
    console.error('Error during account creation:', error);
    res.status(500).json({ 
      error: 'Internal server error',
      success: false
    });
  }
});

// Google SSO endpoints
app.get('/auth/google', (req, res) => {
  console.log('Google SSO request received');
  console.log('GOOGLE_CLIENT_ID:', process.env.GOOGLE_CLIENT_ID ? 'Set' : 'Not set');
  console.log('GOOGLE_CLIENT_SECRET:', process.env.GOOGLE_CLIENT_SECRET ? 'Set' : 'Not set');
  
  if (!process.env.GOOGLE_CLIENT_ID) {
    return res.status(500).json({ error: 'Google OAuth not configured' });
  }
  
  const authUrl = `https://accounts.google.com/o/oauth2/v2/auth?` +
    `client_id=${process.env.GOOGLE_CLIENT_ID}&` +
    `redirect_uri=${encodeURIComponent('http://localhost:3001')}&` +
    `scope=email profile&` +
    `response_type=code&` +
    `state=${Math.random().toString(36)}`;
  
  console.log('Redirecting to:', authUrl);
  res.redirect(authUrl);
});

app.get('/', async (req, res) => {
  const { code } = req.query;
  
  // If there's no code, this is a regular health check or root request
  if (!code) {
    return res.json({ status: 'OK', message: 'Training Sessions API is running' });
  }
  
  // Handle Google OAuth callback
  try {
    // Exchange code for access token
    const tokenResponse = await fetch('https://oauth2.googleapis.com/token', {
      method: 'POST',
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
      body: new URLSearchParams({
        client_id: process.env.GOOGLE_CLIENT_ID,
        client_secret: process.env.GOOGLE_CLIENT_SECRET,
        code,
        grant_type: 'authorization_code',
        redirect_uri: 'http://localhost:3001'
      })
    });
    
    if (!tokenResponse.ok) {
      throw new Error('Failed to exchange code for token');
    }
    
    const tokens = await tokenResponse.json();
    
    // Get user info from Google
    const userResponse = await fetch(`https://www.googleapis.com/oauth2/v2/userinfo?access_token=${tokens.access_token}`);
    
    if (!userResponse.ok) {
      throw new Error('Failed to get user info from Google');
    }
    
    const googleUser = await userResponse.json();
    
    // Find or create user in your database
    let user = await dbService.getUserByEmail(googleUser.email);
    
    if (!user) {
      // Create new user from Google profile
      const username = googleUser.email.split('@')[0]; // Use email prefix as username
      user = await dbService.createSSOUser({
        username: username,
        email: googleUser.email,
        provider: 'google',
        external_id: googleUser.id,
        avatar_url: googleUser.picture
      });
    } else if (user.provider === 'google' && !user.avatar_url) {
      // Update existing user with avatar if missing
      await dbService.updateUserAvatar(user.id, googleUser.picture);
      user.avatar_url = googleUser.picture;
    }
    
    // Generate your JWT (same as existing login)
    const token = jwt.sign(
      { userId: user.id, username: user.username },
      JWT_SECRET,
      { expiresIn: '24h' }
    );
    
    // Redirect to frontend with token and user info
    const userInfo = encodeURIComponent(JSON.stringify({
      id: user.id,
      username: user.username,
      email: user.email,
      provider: user.provider,
      avatar_url: user.avatar_url
    }));
    res.redirect(`http://localhost:5173/login?sso=success&token=${token}&user=${userInfo}`);
    
  } catch (error) {
    console.error('Google SSO error:', error);
    res.redirect('http://localhost:5173/login?sso=error&message=' + encodeURIComponent(error.message));
  }
});

// GitHub SSO endpoints
app.get('/auth/github', (req, res) => {
  console.log('GitHub SSO request received');
  console.log('GITHUB_CLIENT_ID:', process.env.GITHUB_CLIENT_ID ? 'Set' : 'Not set');
  console.log('GITHUB_CLIENT_SECRET:', process.env.GITHUB_CLIENT_SECRET ? 'Set' : 'Not set');
  
  if (!process.env.GITHUB_CLIENT_ID) {
    return res.status(500).json({ error: 'GitHub OAuth not configured' });
  }
  
  const authUrl = `https://github.com/login/oauth/authorize?` +
    `client_id=${process.env.GITHUB_CLIENT_ID}&` +
    `redirect_uri=${encodeURIComponent(process.env.GITHUB_REDIRECT_URI || 'http://localhost:3001/auth/github/callback')}&` +
    `scope=user:email&` +
    `state=${Math.random().toString(36).substring(7)}`;
  
  console.log('Redirecting to:', authUrl);
  res.redirect(authUrl);
});

// GitHub OAuth callback
app.get('/auth/github/callback', async (req, res) => {
  try {
    const { code, state } = req.query;
    
    if (!code) {
      return res.redirect('http://localhost:5173/login?sso=error&message=' + encodeURIComponent('No authorization code received'));
    }
    
    console.log('GitHub OAuth callback received, code:', code);
    
    // Exchange code for access token
    const tokenResponse = await fetch('https://github.com/login/oauth/access_token', {
      method: 'POST',
      headers: {
        'Accept': 'application/json',
        'Content-Type': 'application/x-www-form-urlencoded',
      },
      body: new URLSearchParams({
        client_id: process.env.GITHUB_CLIENT_ID,
        client_secret: process.env.GITHUB_CLIENT_SECRET,
        code: code,
        redirect_uri: process.env.GITHUB_REDIRECT_URI || 'http://localhost:3001/auth/github/callback'
      })
    });
    
    const tokenData = await tokenResponse.json();
    
    if (tokenData.error) {
      throw new Error(`GitHub token error: ${tokenData.error_description}`);
    }
    
    console.log('GitHub access token received');
    
    // Fetch user data from GitHub API
    const userResponse = await fetch('https://api.github.com/user', {
      headers: {
        'Authorization': `Bearer ${tokenData.access_token}`,
        'Accept': 'application/vnd.github.v3+json'
      }
    });
    
    const githubUser = await userResponse.json();
    
    if (!githubUser.id) {
      throw new Error('Failed to fetch GitHub user data');
    }
    
    console.log('GitHub user data:', { id: githubUser.id, login: githubUser.login, email: githubUser.email });
    
    // Check if user exists by GitHub ID first (most reliable)
    const existingUsers = await dbService.getAllUsers();
    let user = existingUsers.find(u => u.external_id === githubUser.id.toString() && u.provider === 'github');
    
    // If not found by GitHub ID, check by email
    if (!user && githubUser.email) {
      user = await dbService.getUserByEmail(githubUser.email);
    }
    
    if (!user) {
      // Create new GitHub user with unique username
      const uniqueUsername = `github_${githubUser.login}_${githubUser.id}`;
      const newUser = {
        username: uniqueUsername,
        email: githubUser.email || `${githubUser.login}@github.local`,
        provider: 'github',
        external_id: githubUser.id.toString(),
        avatar_url: githubUser.avatar_url
      };
      
      console.log('Creating new GitHub user:', newUser);
      user = await dbService.createSSOUser(newUser);
    } else {
      // Update existing user's avatar if missing
      if (!user.avatar_url && githubUser.avatar_url) {
        await dbService.updateUserAvatar(user.id, githubUser.avatar_url);
        user.avatar_url = githubUser.avatar_url;
      }
    }
    
    // Generate JWT token
    const token = jwt.sign(
      { 
        userId: user.id, 
        username: user.username,
        email: user.email,
        provider: user.provider
      },
      JWT_SECRET,
      { expiresIn: '24h' }
    );
    
    // Prepare user info for frontend
    const userInfo = {
      id: user.id,
      username: user.username,
      email: user.email,
      provider: user.provider,
      avatar_url: user.avatar_url
    };
    
    console.log('GitHub SSO successful, redirecting to frontend');
    
    // Redirect to frontend with token and user info
    res.redirect(`http://localhost:5173/login?sso=success&token=${token}&user=${encodeURIComponent(JSON.stringify(userInfo))}`);
    
  } catch (error) {
    console.error('GitHub SSO error:', error);
    res.redirect('http://localhost:5173/login?sso=error&message=' + encodeURIComponent(error.message));
  }
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
