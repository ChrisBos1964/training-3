import { test, expect } from "@playwright/test";

// Auth API coverage using Playwright's `request` fixture.
// Flow:
// 1) Create a new account
// 2) Login successfully and capture token
// 3) Login failure with wrong password
// 4) Forgot-password resets and returns a new password

test.describe("Auth API", () => {
  test("create-account then login and forgot-password", async ({
    request,
    baseURL,
  }) => {
    // Generate a unique username for isolation across test runs
    const username = `user_${Date.now()}`;
    // Create a simple random password for the new account
    const password = "pw-" + Math.random().toString(36).slice(2, 8);

    // create-account
    // Create account
    // Send POST /api/create-account with username and password
    const createRes = await request.post(`${baseURL}/api/create-account`, {
      data: { username, password },
    });
    // Expect 201 Created on successful account creation
    expect(createRes.status()).toBe(201);
    // Parse JSON response body
    const created = await createRes.json();
    // Validate success flag in response
    expect(created.success).toBe(true);

    // login success
    // Login (success)
    // Send POST /api/login with the same credentials
    const loginRes = await request.post(`${baseURL}/api/login`, {
      data: { username, password },
    });
    // Expect an OK status (2xx)
    expect(loginRes.ok()).toBeTruthy();
    // Parse login JSON response
    const login = await loginRes.json();
    // Ensure login succeeded
    expect(login.success).toBe(true);
    // JWT token should be a string
    expect(typeof login.token).toBe("string");

    // login failure
    // Login (failure)
    // Attempt login with wrong password
    const badLoginRes = await request.post(`${baseURL}/api/login`, {
      data: { username, password: "wrong" },
    });
    // Expect 401 Unauthorized
    expect(badLoginRes.status()).toBe(401);

    // forgot-password
    // Forgot password
    // Trigger password reset by username
    const forgotRes = await request.post(`${baseURL}/api/forgot-password`, {
      data: { username },
    });
    // Expect an OK status (2xx)
    expect(forgotRes.ok()).toBeTruthy();
    // Parse JSON response with new password
    const forgot = await forgotRes.json();
    // Validate success flag in response
    expect(forgot.success).toBe(true);
    // The new generated password should be a string
    expect(typeof forgot.newPassword).toBe("string");
  });
});
