import { test, expect } from '@playwright/test';

test.describe('Authentication API', () => {
  const baseURL = 'http://localhost:3001';

  test('should login successfully with correct credentials', async ({ request }) => {
    const response = await request.post(`${baseURL}/api/login`, {
      data: {
        username: 'joel',
        password: 'joel'
      }
    });

    expect(response.status()).toBe(200);
    
    const data = await response.json();
    expect(data.success).toBe(true);
    expect(data.message).toBe('Login successful');
    expect(data.token).toBeDefined();
    expect(data.user).toBeDefined();
    expect(data.user.username).toBe('joel');
    expect(data.user.id).toBeDefined();
  });

  test('should fail login with incorrect username', async ({ request }) => {
    const response = await request.post(`${baseURL}/api/login`, {
      data: {
        username: 'wronguser',
        password: 'joel'
      }
    });

    expect(response.status()).toBe(401);
    
    const data = await response.json();
    expect(data.success).toBe(false);
    expect(data.error).toBe('Invalid credentials');
  });

  test('should fail login with incorrect password', async ({ request }) => {
    const response = await request.post(`${baseURL}/api/login`, {
      data: {
        username: 'joel',
        password: 'wrongpassword'
      }
    });

    expect(response.status()).toBe(401);
    
    const data = await response.json();
    expect(data.success).toBe(false);
    expect(data.error).toBe('Invalid credentials');
  });

  test('should fail login with missing username', async ({ request }) => {
    const response = await request.post(`${baseURL}/api/login`, {
      data: {
        password: 'joel'
      }
    });

    expect(response.status()).toBe(400);
    
    const data = await response.json();
    expect(data.success).toBe(false);
    expect(data.error).toBe('Username and password are required');
  });

  test('should fail login with missing password', async ({ request }) => {
    const response = await request.post(`${baseURL}/api/login`, {
      data: {
        username: 'joel'
      }
    });

    expect(response.status()).toBe(400);
    
    const data = await response.json();
    expect(data.success).toBe(false);
    expect(data.error).toBe('Username and password are required');
  });

  test('should fail login with empty credentials', async ({ request }) => {
    const response = await request.post(`${baseURL}/api/login`, {
      data: {}
    });

    expect(response.status()).toBe(400);
    
    const data = await response.json();
    expect(data.success).toBe(false);
    expect(data.error).toBe('Username and password are required');
  });
});
