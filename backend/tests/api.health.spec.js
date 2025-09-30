import { test, expect } from '@playwright/test';

// This suite demonstrates backend API testing without a browser.
// Playwright provides a `request` fixture that acts like a preconfigured
// HTTP client. It uses `baseURL` from Playwright config, so we only
// specify the path segments here.

test.describe('Health API', () => {
  test('GET /health returns OK', async ({ request, baseURL }) => {
    // We can either call with absolute URL (using baseURL) or relative path
    // e.g., `await request.get('/health')`. Using baseURL for clarity.
    const res = await request.get(`${baseURL}/health`);
    expect(res.ok()).toBeTruthy();
    const body = await res.json();
    expect(body).toMatchObject({ status: 'OK' });
  });
});


