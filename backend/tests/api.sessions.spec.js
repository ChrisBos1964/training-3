import { test, expect } from '@playwright/test';

// End-to-end CRUD flow against the Sessions API using Playwright's `request` client.
// Highlights:
// - Uses `baseURL` from config so we can compose absolute URLs.
// - Validates happy path (list → create → get → update → delete) and 404 after delete.
// - Accepts either string or number for `id` in responses for robustness.

test.describe('Sessions API', () => {
  test('CRUD flow', async ({ request, baseURL }) => {
    // list
    // list existing sessions
    // Issue GET /api/sessions to retrieve current sessions
    const listRes = await request.get(`${baseURL}/api/sessions`);
    // Expect 2xx response
    expect(listRes.ok()).toBeTruthy();
    // Parse JSON array of sessions
    const initial = await listRes.json();
    // Validate we received an array
    expect(Array.isArray(initial)).toBe(true);

    // create
    const createPayload = {
      title: 'API Test Session',
      description: 'Created via Playwright API test',
      status: 'Pending',
      duration: 2.5,
    };
    // create a new session
    // POST /api/sessions to create a new session
    const createRes = await request.post(`${baseURL}/api/sessions`, { data: createPayload });
    // Expect 201 Created
    expect(createRes.status()).toBe(201);
    // Parse created session response
    const created = await createRes.json();
    // Ensure an id was returned
    expect(created.id).toBeTruthy();

    const sessionId = created.id;

    // get
    // get the created session by id
    // GET /api/sessions/:id to fetch the new session
    const getRes = await request.get(`${baseURL}/api/sessions/${sessionId}`);
    // Expect 2xx response
    expect(getRes.ok()).toBeTruthy();
    // Parse the fetched session
    const fetched = await getRes.json();
    // Validate title matches the created payload
    expect(fetched.title).toBe(createPayload.title);

    // update
    const updatePayload = {
      title: 'API Test Session Updated',
      description: 'Updated via Playwright API test',
      status: 'In Progress',
      duration: 3.0,
    };
    // update the created session
    // PUT /api/sessions/:id to update fields
    const updateRes = await request.put(`${baseURL}/api/sessions/${sessionId}`, { data: updatePayload });
    // Expect 2xx response
    expect(updateRes.ok()).toBeTruthy();
    // Parse updated payload response
    const updated = await updateRes.json();
    // Validate the title was updated
    expect(updated.title).toBe(updatePayload.title);

    // delete
    // delete the session
    // DELETE /api/sessions/:id to remove the session
    const deleteRes = await request.delete(`${baseURL}/api/sessions/${sessionId}`);
    // Expect 2xx response
    expect(deleteRes.ok()).toBeTruthy();
    // Parse deletion confirmation
    const deleted = await deleteRes.json();
    // Result should indicate deletion
    expect(deleted.deleted).toBe(true);
    // Compare ids as strings to avoid type mismatch
    expect(String(deleted.id)).toBe(String(sessionId));

    // get 404
    // verify subsequent get returns 404
    // Later GET should return 404 since it was deleted
    const get404 = await request.get(`${baseURL}/api/sessions/${sessionId}`);
    expect(get404.status()).toBe(404);
  });
});


