import { test, expect } from '@playwright/test';

test.describe('Training Sessions API Tests', () => {
  test('should return health status', async ({ request }) => {
    const response = await request.get('/health');
    expect(response.ok()).toBeTruthy();
    
    const data = await response.json();
    expect(data.status).toBe('OK');
    expect(data.message).toBe('Training Sessions API is running');
  });

  test('should get all training sessions', async ({ request }) => {
    const response = await request.get('/api/sessions');
    expect(response.ok()).toBeTruthy();
    
    const sessions = await response.json();
    expect(Array.isArray(sessions)).toBeTruthy();
    expect(sessions.length).toBeGreaterThan(0);
    
    // Check structure of first session
    const firstSession = sessions[0];
    expect(firstSession).toHaveProperty('id');
    expect(firstSession).toHaveProperty('title');
    expect(firstSession).toHaveProperty('description');
    expect(firstSession).toHaveProperty('status');
    expect(firstSession).toHaveProperty('created_at');
    expect(firstSession).toHaveProperty('updated_at');
  });

  test('should get training session by ID', async ({ request }) => {
    // First get all sessions to get a valid ID
    const allSessionsResponse = await request.get('/api/sessions');
    const sessions = await allSessionsResponse.json();
    const firstSessionId = sessions[0].id;
    
    // Get specific session by ID
    const response = await request.get(`/api/sessions/${firstSessionId}`);
    expect(response.ok()).toBeTruthy();
    
    const session = await response.json();
    expect(session.id).toBe(firstSessionId);
    expect(session.title).toBeTruthy();
    expect(session.description).toBeTruthy();
    expect(session.status).toBeTruthy();
  });

  test('should return 404 for non-existent session ID', async ({ request }) => {
    const response = await request.get('/api/sessions/99999');
    expect(response.status()).toBe(404);
    
    const error = await response.json();
    expect(error.error).toBe('Training session not found');
  });

  test('should create new training session', async ({ request }) => {
    const newSession = {
      title: 'Test Training Session',
      description: 'This is a test training session created via API',
      status: 'Pending',
      duration: 2.5
    };
    
    const response = await request.post('/api/sessions', {
      data: newSession
    });
    
    expect(response.status()).toBe(201);
    
    const createdSession = await response.json();
    expect(createdSession.title).toBe(newSession.title);
    expect(createdSession.description).toBe(newSession.description);
    expect(createdSession.status).toBe(newSession.status);
    expect(createdSession.duration).toBe(newSession.duration);
    expect(createdSession.id).toBeTruthy();
    expect(createdSession.created_at).toBeTruthy();
    expect(createdSession.updated_at).toBeTruthy();
  });

  test('should create training session without duration', async ({ request }) => {
    const newSession = {
      title: 'Test Session No Duration',
      description: 'This session has no duration specified',
      status: 'In Progress'
    };
    
    const response = await request.post('/api/sessions', {
      data: newSession
    });
    
    expect(response.status()).toBe(201);
    
    const createdSession = await response.json();
    expect(createdSession.title).toBe(newSession.title);
    expect(createdSession.description).toBe(newSession.description);
    expect(createdSession.status).toBe(newSession.status);
    expect(createdSession.duration).toBeNull();
  });

  test('should return 400 for missing required fields', async ({ request }) => {
    const invalidSession = {
      title: 'Missing Fields Test',
      // Missing description and status
      duration: 1.5
    };
    
    const response = await request.post('/api/sessions', {
      data: invalidSession
    });
    
    expect(response.status()).toBe(400);
    
    const error = await response.json();
    expect(error.error).toBe('Title, description, and status are required');
  });

  test('should return 400 for invalid status', async ({ request }) => {
    const invalidSession = {
      title: 'Invalid Status Test',
      description: 'Testing invalid status',
      status: 'InvalidStatus',
      duration: 1.0
    };
    
    const response = await request.post('/api/sessions', {
      data: invalidSession
    });
    
    expect(response.status()).toBe(400);
    
    const error = await response.json();
    expect(error.error).toBe('Status must be one of: Pending, In Progress, Completed');
  });

  test('should update training session', async ({ request }) => {
    // First create a session
    const newSession = {
      title: 'Session to Update',
      description: 'This session will be updated',
      status: 'Pending',
      duration: 1.0
    };
    
    const createResponse = await request.post('/api/sessions', {
      data: newSession
    });
    const createdSession = await createResponse.json();
    
    // Update the session
    const updateData = {
      title: 'Updated Session Title',
      description: 'This session has been updated',
      status: 'In Progress',
      duration: 2.0
    };
    
    const updateResponse = await request.put(`/api/sessions/${createdSession.id}`, {
      data: updateData
    });
    
    expect(updateResponse.ok()).toBeTruthy();
    
    const updatedSession = await updateResponse.json();
    expect(updatedSession.id.toString()).toBe(createdSession.id.toString());
    expect(updatedSession.title).toBe(updateData.title);
    expect(updatedSession.description).toBe(updateData.description);
    expect(updatedSession.status).toBe(updateData.status);
    expect(updatedSession.duration).toBe(updateData.duration);
  });

  test('should return 404 when updating non-existent session', async ({ request }) => {
    const updateData = {
      title: 'Non-existent Session',
      description: 'This session does not exist',
      status: 'Completed',
      duration: 3.0
    };
    
    const response = await request.put('/api/sessions/99999', {
      data: updateData
    });
    
    expect(response.status()).toBe(404);
    
    const error = await response.json();
    expect(error.error).toBe('Training session not found');
  });

  test('should delete training session', async ({ request }) => {
    // First create a session
    const newSession = {
      title: 'Session to Delete',
      description: 'This session will be deleted',
      status: 'Pending',
      duration: 1.5
    };
    
    const createResponse = await request.post('/api/sessions', {
      data: newSession
    });
    const createdSession = await createResponse.json();
    
    // Delete the session
    const deleteResponse = await request.delete(`/api/sessions/${createdSession.id}`);
    
    expect(deleteResponse.ok()).toBeTruthy();
    
    const deleteResult = await deleteResponse.json();
    expect(deleteResult.deleted).toBe(true);
    expect(deleteResult.id.toString()).toBe(createdSession.id.toString());
    
    // Verify session is actually deleted
    const getResponse = await request.get(`/api/sessions/${createdSession.id}`);
    expect(getResponse.status()).toBe(404);
  });

  test('should return 404 when deleting non-existent session', async ({ request }) => {
    const response = await request.delete('/api/sessions/99999');
    
    expect(response.status()).toBe(404);
    
    const error = await response.json();
    expect(error.error).toBe('Training session not found');
  });

  test('should handle multiple CRUD operations', async ({ request }) => {
    // Create multiple sessions
    const sessions = [
      {
        title: 'Multi Test Session 1',
        description: 'First test session',
        status: 'Pending',
        duration: 1.0
      },
      {
        title: 'Multi Test Session 2',
        description: 'Second test session',
        status: 'In Progress',
        duration: 2.0
      }
    ];
    
    const createdSessions = [];
    
    for (const session of sessions) {
      const response = await request.post('/api/sessions', { data: session });
      expect(response.status()).toBe(201);
      createdSessions.push(await response.json());
    }
    
    // Verify all sessions were created
    const allSessionsResponse = await request.get('/api/sessions');
    const allSessions = await allSessionsResponse.json();
    
    const createdIds = createdSessions.map(s => s.id);
    const foundSessions = allSessions.filter(s => createdIds.includes(s.id));
    expect(foundSessions.length).toBe(2);
    
    // Update one session
    const updateData = {
      title: 'Updated Multi Test Session',
      description: 'This session was updated',
      status: 'Completed',
      duration: 1.5
    };
    
    const updateResponse = await request.put(`/api/sessions/${createdSessions[0].id}`, {
      data: updateData
    });
    expect(updateResponse.ok()).toBeTruthy();
    
    // Delete all created sessions
    for (const session of createdSessions) {
      const deleteResponse = await request.delete(`/api/sessions/${session.id}`);
      expect(deleteResponse.ok()).toBeTruthy();
    }
    
    // Verify all sessions were deleted
    const finalSessionsResponse = await request.get('/api/sessions');
    const finalSessions = await finalSessionsResponse.json();
    
    const remainingCreatedSessions = finalSessions.filter(s => createdIds.includes(s.id));
    expect(remainingCreatedSessions.length).toBe(0);
  });
});
