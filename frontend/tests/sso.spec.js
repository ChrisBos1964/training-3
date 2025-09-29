import { test, expect } from '@playwright/test';

test.describe('SSO Authentication Tests', () => {
  test.beforeEach(async ({ page }) => {
    // Clear any existing authentication state
    await page.goto('/login');
    await page.evaluate(() => {
      localStorage.clear();
    });
  });

  test('should display both SSO buttons on login page', async ({ page }) => {
    await page.goto('/login');
    
    // Check Google SSO button
    const googleButton = page.getByTestId('google-sso-button');
    await expect(googleButton).toBeVisible();
    await expect(googleButton).toHaveText('Sign in with Google');
    await expect(googleButton).toBeEnabled();
    
    // Check GitHub SSO button
    const githubButton = page.getByTestId('github-sso-button');
    await expect(githubButton).toBeVisible();
    await expect(githubButton).toHaveText('Sign in with GitHub');
    await expect(githubButton).toBeEnabled();
  });

  test('should have proper ARIA attributes on SSO buttons', async ({ page }) => {
    await page.goto('/login');
    
    // Google SSO button ARIA
    const googleButton = page.getByTestId('google-sso-button');
    await expect(googleButton).toHaveAttribute('aria-label', 'Sign in with Google');
    await expect(googleButton).toHaveAttribute('role', 'button');
    
    // GitHub SSO button ARIA
    const githubButton = page.getByTestId('github-sso-button');
    await expect(githubButton).toHaveAttribute('aria-label', 'Sign in with GitHub');
    await expect(githubButton).toHaveAttribute('role', 'button');
  });

  test('should redirect to Google OAuth when Google button clicked', async ({ page }) => {
    await page.goto('/login');
    
    // Click Google SSO button and wait for navigation
    const [response] = await Promise.all([
      page.waitForResponse(response => response.url().includes('accounts.google.com')),
      page.getByTestId('google-sso-button').click()
    ]);
    
    // Should redirect to Google OAuth
    expect(response.url()).toContain('accounts.google.com');
    expect(response.url()).toContain('oauth2/v2/auth');
  });

  test('should redirect to GitHub OAuth when GitHub button clicked', async ({ page }) => {
    await page.goto('/login');
    
    // Click GitHub SSO button and wait for navigation
    const [response] = await Promise.all([
      page.waitForResponse(response => response.url().includes('github.com')),
      page.getByTestId('github-sso-button').click()
    ]);
    
    // Should redirect to GitHub OAuth
    expect(response.url()).toContain('github.com/login/oauth/authorize');
  });

  test('should handle SSO success callback', async ({ page }) => {
    // Simulate successful SSO callback
    const mockUser = {
      id: 1,
      username: 'testuser',
      email: 'test@example.com',
      provider: 'google',
      avatar_url: 'https://example.com/avatar.jpg'
    };
    
    const mockToken = 'mock_jwt_token_123';
    
    await page.goto(`/login?sso=success&token=${mockToken}&user=${encodeURIComponent(JSON.stringify(mockUser))}`);
    
    // Should redirect to list page
    await expect(page).toHaveURL('/list');
    
    // Wait for header to be visible
    await expect(page.getByTestId('main-nav')).toBeVisible();
    
    // Wait for the header to detect the token and update state
    await page.waitForFunction(() => {
      return localStorage.getItem('token') === 'mock_jwt_token_123';
    });
    
    // Wait for the header component to re-render with logged in state
    await page.waitForFunction(() => {
      const navLogin = document.querySelector('[data-testid="nav-login"]');
      return navLogin && navLogin.textContent.includes('Logged In');
    });
    
    // Alternative approach: wait for the specific element to be visible
    await expect(page.getByTestId('nav-login')).toBeVisible();
    await expect(page.getByTestId('nav-login')).toHaveText('Logged In');
    
    // Should store token in localStorage
    const token = await page.evaluate(() => localStorage.getItem('token'));
    expect(token).toBe(mockToken);
    
    // Should store user info in localStorage
    const user = await page.evaluate(() => localStorage.getItem('user'));
    expect(JSON.parse(user)).toEqual(mockUser);
  });

  test('should handle SSO error callback', async ({ page }) => {
    // Simulate failed SSO callback
    await page.goto('/login?sso=error&message=' + encodeURIComponent('OAuth authentication failed'));
    
    // Should stay on login page (with query parameters)
    await expect(page).toHaveURL(/\/login\?sso=error/);
    
    // Should show error message
    await expect(page.getByTestId('login-error')).toBeVisible();
    await expect(page.getByTestId('login-error')).toHaveText('OAuth authentication failed');
  });

  test('should display GitHub avatar when logged in via GitHub', async ({ page }) => {
    // Simulate GitHub SSO login
    const mockGitHubUser = {
      id: 1,
      username: 'github_testuser_12345',
      email: 'test@github.com',
      provider: 'github',
      avatar_url: 'https://avatars.githubusercontent.com/u/12345?v=4'
    };
    
    const mockToken = 'mock_jwt_token_github';
    
    await page.goto(`/login?sso=success&token=${mockToken}&user=${encodeURIComponent(JSON.stringify(mockGitHubUser))}`);
    
    // Should redirect to list page
    await expect(page).toHaveURL('/list');
    
    // Wait for header to be visible
    await expect(page.getByTestId('main-nav')).toBeVisible();
    
    // Wait for the header to detect the token and update state
    await page.waitForFunction(() => {
      return localStorage.getItem('token') === 'mock_jwt_token_github';
    });
    
    // Wait for the header component to re-render with logged in state
    await page.waitForFunction(() => {
      const navLogin = document.querySelector('[data-testid="nav-login"]');
      return navLogin && navLogin.textContent.includes('Logged In');
    });
    
    // Should show GitHub avatar in header
    const avatar = page.locator('.user-avatar');
    await expect(avatar).toBeVisible();
    await expect(avatar).toHaveAttribute('src', mockGitHubUser.avatar_url);
    await expect(avatar).toHaveAttribute('alt', 'Profile');
  });

  test('should display Google avatar when logged in via Google', async ({ page }) => {
    // Simulate Google SSO login
    const mockGoogleUser = {
      id: 1,
      username: 'google_testuser_67890',
      email: 'test@gmail.com',
      provider: 'google',
      avatar_url: 'https://lh3.googleusercontent.com/a/ACg8ocJ...'
    };
    
    const mockToken = 'mock_jwt_token_google';
    
    await page.goto(`/login?sso=success&token=${mockToken}&user=${encodeURIComponent(JSON.stringify(mockGoogleUser))}`);
    
    // Should redirect to list page
    await expect(page).toHaveURL('/list');
    
    // Wait for header to be visible
    await expect(page.getByTestId('main-nav')).toBeVisible();
    
    // Wait for the header to detect the token and update state
    await page.waitForFunction(() => {
      return localStorage.getItem('token') === 'mock_jwt_token_google';
    });
    
    // Wait for the header component to re-render with logged in state
    await page.waitForFunction(() => {
      const navLogin = document.querySelector('[data-testid="nav-login"]');
      return navLogin && navLogin.textContent.includes('Logged In');
    });
    
    // Should show Google avatar in header
    const avatar = page.locator('.user-avatar');
    await expect(avatar).toBeVisible();
    await expect(avatar).toHaveAttribute('src', mockGoogleUser.avatar_url);
    await expect(avatar).toHaveAttribute('alt', 'Profile');
  });

  test('should show provider-specific tooltip on hover', async ({ page }) => {
    // Simulate Google SSO login
    const mockGoogleUser = {
      id: 1,
      username: 'google_testuser_67890',
      email: 'test@gmail.com',
      provider: 'google',
      avatar_url: 'https://lh3.googleusercontent.com/a/ACg8ocJ...'
    };
    
    const mockToken = 'mock_jwt_token_google';
    
    await page.goto(`/login?sso=success&token=${mockToken}&user=${encodeURIComponent(JSON.stringify(mockGoogleUser))}`);
    await page.goto('/list');
    
    // Wait for header to be visible
    await expect(page.getByTestId('main-nav')).toBeVisible();
    
    // Wait for the header to detect the token and update state
    await page.waitForFunction(() => {
      return localStorage.getItem('token') === 'mock_jwt_token_google';
    });
    
    // Wait for the header component to re-render with logged in state
    await page.waitForFunction(() => {
      const navLogin = document.querySelector('[data-testid="nav-login"]');
      return navLogin && navLogin.textContent.includes('Logged In');
    });
    
    // Wait for the specific element to be visible
    await expect(page.getByTestId('nav-login')).toBeVisible();
    await expect(page.getByTestId('nav-login')).toHaveText('Logged In');
    
    // Hover over logged in button
    const loggedInButton = page.getByTestId('nav-login');
    await loggedInButton.hover();
    
    // Should show tooltip with email and provider
    await expect(loggedInButton).toHaveAttribute('title', 'Logged in as test@gmail.com via Google');
  });

  test('should disable SSO buttons during loading state', async ({ page }) => {
    await page.goto('/login');
    
    // Start a form submission to trigger loading state
    await page.getByLabel('Username *').fill('testuser');
    await page.getByLabel('Password *').fill('testpass');
    
    // Click regular login button to trigger loading
    await page.getByRole('button', { name: 'Sign in to your account' }).click();
    
    // SSO buttons should be disabled during loading
    await expect(page.getByTestId('google-sso-button')).toBeDisabled();
    await expect(page.getByTestId('github-sso-button')).toBeDisabled();
  });
});
