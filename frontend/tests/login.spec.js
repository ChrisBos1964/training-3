import { test, expect } from '@playwright/test';

test.describe('Login Flow', () => {
  test.beforeEach(async ({ page }) => {
    // Reset auth state and navigate to a page with header
    await page.addInitScript(() => localStorage.clear());
    await page.goto('/list');
  });

  test('should display login button in header', async ({ page }) => {
    const header = page.getByRole('banner');
    await expect(header).toBeVisible();
    
    const loginLink = header.getByRole('link', { name: 'Sign in to your account' });
    await expect(loginLink).toBeVisible();
    await expect(loginLink).toHaveAttribute('data-testid', 'nav-login');
    await expect(loginLink).toHaveText('Login');
  });

  test('should navigate to login page when login button is clicked', async ({ page }) => {
    const header = page.getByRole('banner');
    const loginLink = header.getByRole('link', { name: 'Sign in to your account' });
    
    await loginLink.click();
    await expect(page).toHaveURL('/login');
  });

  test('should display login form with proper ARIA attributes', async ({ page }) => {
    await page.goto('/login');
    
    // Check page structure
    await expect(page.getByTestId('login-page')).toBeVisible();
    await expect(page.getByTestId('login-title')).toHaveText('Login');
    await expect(page.getByTestId('login-description')).toBeVisible();
    
    // Check main element
    const main = page.getByRole('main', { name: 'Login form' });
    await expect(main).toBeVisible();
    
    // Check form
    const form = page.getByRole('form', { name: 'Login Form' });
    await expect(form).toBeVisible();
    
    // Check inputs
    const usernameInput = page.getByLabel('Username *');
    await expect(usernameInput).toBeVisible();
    await expect(usernameInput).toHaveAttribute('aria-required', 'true');
    await expect(usernameInput).toHaveAttribute('data-testid', 'login-username-input');
    
    const passwordInput = page.getByLabel('Password *');
    await expect(passwordInput).toBeVisible();
    await expect(passwordInput).toHaveAttribute('aria-required', 'true');
    await expect(passwordInput).toHaveAttribute('data-testid', 'login-password-input');
    
    // Check buttons
    const submitButton = page.getByRole('button', { name: 'Sign in to your account' });
    await expect(submitButton).toBeVisible();
    await expect(submitButton).toHaveAttribute('data-testid', 'login-submit');
    
    const cancelButton = page.getByRole('button', { name: 'Cancel and return to previous page' });
    await expect(cancelButton).toBeVisible();
    await expect(cancelButton).toHaveAttribute('data-testid', 'login-cancel');
  });

  test('should login successfully with correct credentials', async ({ page }) => {
    await page.goto('/login');
    
    // Fill in correct credentials
    await page.getByLabel('Username *').fill('joel');
    await page.getByLabel('Password *').fill('grimberg');
    
    // Submit form
    await page.getByRole('button', { name: 'Sign in to your account' }).click();
    
    // Should navigate to list page
    await expect(page).toHaveURL('/list');
    
    // Should still have header
    await expect(page.getByRole('banner')).toBeVisible();
    
    // Header should show "Logged In" as a clickable link
    const header = page.getByRole('banner');
    const loggedInLink = header.getByRole('link', { name: 'You are logged in - click to logout' });
    await expect(loggedInLink).toBeVisible();
    await expect(loggedInLink).toHaveText('Logged In');
    await expect(loggedInLink).toHaveAttribute('data-testid', 'nav-login');
    await expect(loggedInLink).toHaveAttribute('href', '/login');
  });

  test('should show error message with incorrect credentials', async ({ page }) => {
    await page.goto('/login');
    
    // Fill in incorrect credentials
    await page.getByLabel('Username *').fill('wronguser');
    await page.getByLabel('Password *').fill('wrongpassword');
    
    // Submit form
    await page.getByRole('button', { name: 'Sign in to your account' }).click();
    
    // Should show error message
    const errorMessage = page.getByRole('alert');
    await expect(errorMessage).toBeVisible();
    await expect(errorMessage).toHaveText('Invalid credentials');
    await expect(errorMessage).toHaveAttribute('data-testid', 'login-error');
    
    // Should stay on login page
    await expect(page).toHaveURL('/login');
  });

  test('should show error message with incorrect password', async ({ page }) => {
    await page.goto('/login');
    
    // Fill in correct username but wrong password
    await page.getByLabel('Username *').fill('joel');
    await page.getByLabel('Password *').fill('wrongpassword');
    
    // Submit form
    await page.getByRole('button', { name: 'Sign in to your account' }).click();
    
    // Should show error message
    const errorMessage = page.getByRole('alert');
    await expect(errorMessage).toBeVisible();
    await expect(errorMessage).toHaveText('Invalid credentials');
    
    // Should stay on login page
    await expect(page).toHaveURL('/login');
  });

  test('should clear error message when user starts typing', async ({ page }) => {
    await page.goto('/login');
    
    // Fill form with invalid credentials to trigger an error
    await page.getByLabel('Username *').fill('invalid');
    await page.getByLabel('Password *').fill('invalid');
    await page.getByRole('button', { name: 'Sign in to your account' }).click();
    
    // Wait for error to appear
    await expect(page.getByRole('alert')).toBeVisible();
    
    // Start typing in username field to clear error
    await page.getByLabel('Username *').fill('j');
    
    // Error should be cleared
    const errorMessage = page.getByRole('alert');
    await expect(errorMessage).toHaveCount(0);
  });

  test('should disable submit button when form is invalid', async ({ page }) => {
    await page.goto('/login');
    
    const submitButton = page.getByRole('button', { name: 'Sign in to your account' });
    
    // Should be disabled with empty form
    await expect(submitButton).toBeDisabled();
    
    // Fill only username
    await page.getByLabel('Username *').fill('joel');
    await expect(submitButton).toBeDisabled();
    
    // Fill password too
    await page.getByLabel('Password *').fill('grimberg');
    await expect(submitButton).toBeEnabled();
  });

  test('should navigate back to previous page when cancel button is clicked', async ({ page }) => {
    // First navigate to a page with header
    await page.goto('/list');
    
    // Then navigate to login page
    await page.goto('/login');
    
    const cancelButton = page.getByRole('button', { name: 'Cancel' });
    await cancelButton.click();
    
    // Should navigate back to previous page (list page)
    await expect(page).toHaveURL('/list');
    
    // Should have header on list page
    await expect(page.getByRole('banner')).toBeVisible();
  });

  // Removed: Back to home button no longer exists on login page

  test('should show loading state during login', async ({ page }) => {
    await page.goto('/login');
    
    // Fill in credentials
    await page.getByLabel('Username *').fill('joel');
    await page.getByLabel('Password *').fill('grimberg');
    
    // Submit form
    const submitButton = page.getByRole('button', { name: 'Sign in to your account' });
    await submitButton.click();
    
    // Should show loading state briefly
    await expect(submitButton).toHaveText('Signing in...');
    await expect(submitButton).toBeDisabled();
    
    // Should eventually navigate to list page
    await expect(page).toHaveURL('/list');
  });

  test('should have proper focus management', async ({ page }) => {
    await page.goto('/login');
    
    // Username input should be auto-focused on page load
    await expect(page.getByLabel('Username *')).toBeFocused();
    
    // Tab through form elements
    await page.keyboard.press('Tab'); // Should focus password input
    await expect(page.getByLabel('Password *')).toBeFocused();
    
    // Fill in form to enable submit button
    await page.getByLabel('Username *').fill('testuser');
    await page.getByLabel('Password *').fill('testpass');
    
    // Now tab to submit button (should be enabled and focusable)
    await page.keyboard.press('Tab'); // Should focus submit button
    await expect(page.getByRole('button', { name: 'Sign in to your account' })).toBeFocused();
  });

  test('should have proper ARIA roles for logged-in state', async ({ page }) => {
    // First login
    await page.goto('/login');
    await page.getByLabel('Username *').fill('joel');
    await page.getByLabel('Password *').fill('grimberg');
    await page.getByRole('button', { name: 'Sign in to your account' }).click();
    
    // Should navigate to list page
    await expect(page).toHaveURL('/list');
    
    // Check that logged-in status has proper ARIA role
    const header = page.getByRole('banner');
    const loggedInLink = header.getByRole('link', { name: 'You are logged in - click to logout' });
    await expect(loggedInLink).toBeVisible();
    await expect(loggedInLink).toHaveText('Logged In');
    
    // Should be a clickable link when logged in
    await expect(loggedInLink).toHaveAttribute('href', '/login');
    await expect(loggedInLink).toHaveAttribute('role', 'link');
  });

  test('should show logout form when user is already logged in', async ({ page }) => {
    // First login
    await page.goto('/login');
    await page.getByLabel('Username *').fill('joel');
    await page.getByLabel('Password *').fill('grimberg');
    await page.getByRole('button', { name: 'Sign in to your account' }).click();
    
    // Wait for successful login redirect to list page
    await expect(page).toHaveURL('/list');
    
    // Click the "Logged In" button in the header to navigate to logout form
    const header = page.getByRole('banner');
    const loggedInLink = header.getByRole('link', { name: 'You are logged in - click to logout' });
    await loggedInLink.click();
    
    // Should navigate to login page showing logout form
    await expect(page).toHaveURL('/login');
    
    // Wait for the logout form to be visible (indicates logged in state)
    await expect(page.getByTestId('logout-form')).toBeVisible({ timeout: 10000 });
    
    // Should show logout form
    await expect(page.getByTestId('login-title')).toHaveText('Logout');
    await expect(page.getByTestId('login-description')).toHaveText('You are currently logged in. Sign out to end your session.');
    
    // Should show logout form elements
    await expect(page.getByTestId('logout-form')).toBeVisible();
    
    // Should show logout buttons
    const cancelButton = page.getByRole('button', { name: 'Cancel' });
    await expect(cancelButton).toBeVisible();
    await expect(cancelButton).toHaveAttribute('data-testid', 'logout-cancel');
    
    const logoutButton = page.getByRole('button', { name: 'Sign out and end your session' });
    await expect(logoutButton).toBeVisible();
    await expect(logoutButton).toHaveAttribute('data-testid', 'logout-submit');
    await expect(logoutButton).toHaveText('Logout');
  });

  test('should logout successfully and reset header', async ({ page }) => {
    // First login
    await page.goto('/login');
    await page.getByLabel('Username *').fill('joel');
    await page.getByLabel('Password *').fill('grimberg');
    await page.getByRole('button', { name: 'Sign in to your account' }).click();
    
    // Wait for successful login redirect to list page
    await expect(page).toHaveURL('/list');
    
    // Click the "Logged In" button in the header to navigate to logout form
    const logoutHeader = page.getByRole('banner');
    const logoutLink = logoutHeader.getByRole('link', { name: 'You are logged in - click to logout' });
    await logoutLink.click();
    
    // Wait for the logout form to be visible
    await expect(page.getByTestId('logout-form')).toBeVisible({ timeout: 10000 });
    
    // Click logout button
    await page.getByRole('button', { name: 'Sign out and end your session' }).click();
    
    // Should navigate to home page
    await expect(page).toHaveURL('/');
    
    // Should not have header on home page
    await expect(page.getByRole('banner')).not.toBeVisible();
    
    // Navigate to a page with header to check login status
    await page.getByRole('button', { name: "Let's start training sessions" }).click();
    await expect(page).toHaveURL('/list');
    
    // Header should show "Login" again
    const header = page.getByRole('banner');
    const loginLink = header.getByRole('link', { name: 'Sign in to your account' });
    await expect(loginLink).toBeVisible();
    await expect(loginLink).toHaveText('Login');
  });

  test('should cancel logout and return to previous page', async ({ page }) => {
    // First login
    await page.goto('/login');
    await page.getByLabel('Username *').fill('joel');
    await page.getByLabel('Password *').fill('grimberg');
    await page.getByRole('button', { name: 'Sign in to your account' }).click();
    
    // Navigate to list page
    await expect(page).toHaveURL('/list');
    
    // Click the "Logged In" button in the header to navigate to logout form
    const cancelHeader = page.getByRole('banner');
    const cancelLink = cancelHeader.getByRole('link', { name: 'You are logged in - click to logout' });
    await cancelLink.click();
    
    // Click cancel button
    await page.getByRole('button', { name: 'Cancel' }).click();
    
    // Should navigate back to list page (previous page)
    await expect(page).toHaveURL('/list');
    
    // Should still be logged in
    const header = page.getByRole('banner');
    const loggedInLink = header.getByRole('link', { name: 'You are logged in - click to logout' });
    await expect(loggedInLink).toBeVisible();
    await expect(loggedInLink).toHaveText('Logged In');
  });

  test('should have proper ARIA roles for logout form', async ({ page }) => {
    // First login
    await page.goto('/login');
    await page.getByLabel('Username *').fill('joel');
    await page.getByLabel('Password *').fill('grimberg');
    await page.getByRole('button', { name: 'Sign in to your account' }).click();
    
    // Wait for successful login redirect to list page
    await expect(page).toHaveURL('/list');
    
    // Click the "Logged In" button in the header to navigate to logout form
    const ariaHeader = page.getByRole('banner');
    const ariaLink = ariaHeader.getByRole('link', { name: 'You are logged in - click to logout' });
    await ariaLink.click();
    
    // Wait for the logout form to be visible
    await expect(page.getByTestId('logout-form')).toBeVisible({ timeout: 10000 });
    
    // Check main element has correct aria-label
    const main = page.getByRole('main', { name: 'Logout form' });
    await expect(main).toBeVisible();
    
    // Check form has correct role
    const logoutForm = page.getByRole('form', { name: 'Logout Form' });
    await expect(logoutForm).toBeVisible();
    
    // Should not have status element (removed)
    await expect(page.getByRole('status')).not.toBeVisible();
    
    // Check buttons have proper roles
    const cancelButton = page.getByRole('button', { name: 'Cancel logout and return to previous page' });
    await expect(cancelButton).toHaveAttribute('role', 'button');
    
    const logoutButton = page.getByRole('button', { name: 'Sign out and end your session' });
    await expect(logoutButton).toHaveAttribute('role', 'button');
  });

  test('should not show login form inputs when logged in', async ({ page }) => {
    // First login
    await page.goto('/login');
    await page.getByLabel('Username *').fill('joel');
    await page.getByLabel('Password *').fill('grimberg');
    await page.getByRole('button', { name: 'Sign in to your account' }).click();
    
    // Wait for successful login redirect to list page
    await expect(page).toHaveURL('/list');
    
    // Click the "Logged In" button in the header to navigate to logout form
    const inputsHeader = page.getByRole('banner');
    const inputsLink = inputsHeader.getByRole('link', { name: 'You are logged in - click to logout' });
    await inputsLink.click();
    
    // Wait for the logout form to be visible (indicates logged in state)
    await expect(page.getByTestId('logout-form')).toBeVisible({ timeout: 10000 });
    
    // Should not show login form inputs
    await expect(page.getByLabel('Username *')).not.toBeVisible();
    await expect(page.getByLabel('Password *')).not.toBeVisible();
    await expect(page.getByTestId('login-form')).not.toBeVisible();
    
    // Should show logout form instead
    await expect(page.getByTestId('logout-form')).toBeVisible();
  });

  test('should navigate to logout form when clicking Logged In in header', async ({ page }) => {
    // First login
    await page.goto('/login');
    await page.getByLabel('Username *').fill('joel');
    await page.getByLabel('Password *').fill('grimberg');
    await page.getByRole('button', { name: 'Sign in to your account' }).click();
    
    // Navigate to list page
    await expect(page).toHaveURL('/list');
    
    // Click "Logged In" in header
    const header = page.getByRole('banner');
    const loggedInLink = header.getByRole('link', { name: 'You are logged in - click to logout' });
    await loggedInLink.click();
    
    // Should navigate to login page and show logout form
    await expect(page).toHaveURL('/login');
    await expect(page.getByTestId('login-title')).toHaveText('Logout');
    await expect(page.getByTestId('logout-form')).toBeVisible();
  });

  test('should not show back to home button', async ({ page }) => {
    // Navigate to login page
    await page.goto('/login');
    
    // Should not show back to home button (removed entirely)
    await expect(page.getByTestId('login-page-nav')).not.toBeVisible();
    await expect(page.getByRole('button', { name: 'Go back to home page' })).not.toBeVisible();
  });

  test('should show "Log out" text when hovering over "Logged In" button', async ({ page }) => {
    // First login
    await page.goto('/login');
    await page.getByLabel('Username *').fill('joel');
    await page.getByLabel('Password *').fill('grimberg');
    await page.getByRole('button', { name: 'Sign in to your account' }).click();
    
    // Navigate to list page
    await expect(page).toHaveURL('/list');
    
    // Get the logged in link
    const header = page.getByRole('banner');
    const loggedInLink = header.getByRole('link', { name: 'You are logged in - click to logout' });
    
    // Should show "Logged In" by default
    await expect(loggedInLink).toHaveText('Logged In');
    
    // Hover over the link
    await loggedInLink.hover();
    
    // Should show "Log out" when hovering
    await expect(loggedInLink).toHaveText('Log out');
    
    // Move mouse away
    await page.mouse.move(0, 0);
    
    // Should show "Logged In" again
    await expect(loggedInLink).toHaveText('Logged In');
  });

  test('should maintain consistent button width when text changes', async ({ page }) => {
    // First login
    await page.goto('/login');
    await page.getByLabel('Username *').fill('joel');
    await page.getByLabel('Password *').fill('grimberg');
    await page.getByRole('button', { name: 'Sign in to your account' }).click();
    
    // Navigate to list page
    await expect(page).toHaveURL('/list');
    
    // Get the logged in link
    const header = page.getByRole('banner');
    const loggedInLink = header.getByRole('link', { name: 'You are logged in - click to logout' });
    
    // Get initial width
    const initialBox = await loggedInLink.boundingBox();
    const initialWidth = initialBox.width;
    
    // Hover over the link
    await loggedInLink.hover();
    
    // Get width when hovering (should be the same)
    const hoverBox = await loggedInLink.boundingBox();
    const hoverWidth = hoverBox.width;
    
    // Move mouse away
    await page.mouse.move(0, 0);
    
    // Get width when not hovering (should be the same)
    const finalBox = await loggedInLink.boundingBox();
    const finalWidth = finalBox.width;
    
    // All widths should be the same (within 1px tolerance for rounding)
    expect(Math.abs(initialWidth - hoverWidth)).toBeLessThan(1);
    expect(Math.abs(initialWidth - finalWidth)).toBeLessThan(1);
    expect(Math.abs(hoverWidth - finalWidth)).toBeLessThan(1);
    
    // Width should be approximately 120px (within 5px tolerance for different browsers/fonts)
    expect(initialWidth).toBeGreaterThan(115);
    expect(initialWidth).toBeLessThan(125);
  });

  test('should show forgot password link with proper ARIA roles', async ({ page }) => {
    await page.goto('/login');
    
    // Should show forgot password section
    await expect(page.getByTestId('forgot-password-section')).toBeVisible();
    
    // Should show forgot password link
    const forgotPasswordLink = page.getByRole('button', { name: 'Reset password for entered username' });
    await expect(forgotPasswordLink).toBeVisible();
    await expect(forgotPasswordLink).toHaveText('Forgot password?');
    await expect(forgotPasswordLink).toHaveAttribute('data-testid', 'forgot-password-link');
    
    // Should be disabled initially (no username entered)
    await expect(forgotPasswordLink).toBeDisabled();
  });

  test('should enable forgot password link when username is entered', async ({ page }) => {
    await page.goto('/login');
    
    const forgotPasswordLink = page.getByRole('button', { name: 'Reset password for entered username' });
    
    // Should be disabled initially
    await expect(forgotPasswordLink).toBeDisabled();
    
    // Enter username
    await page.getByLabel('Username *').fill('joel');
    
    // Should be enabled now
    await expect(forgotPasswordLink).toBeEnabled();
  });

  test('should disable forgot password link when username is cleared', async ({ page }) => {
    await page.goto('/login');
    
    const forgotPasswordLink = page.getByRole('button', { name: 'Reset password for entered username' });
    
    // Enter username
    await page.getByLabel('Username *').fill('joel');
    await expect(forgotPasswordLink).toBeEnabled();
    
    // Clear username
    await page.getByLabel('Username *').fill('');
    
    // Should be disabled again
    await expect(forgotPasswordLink).toBeDisabled();
  });

  test.skip('should reset password successfully for valid username', async ({ page }) => {
    await page.goto('/login');
    
    // Enter username
    await page.getByLabel('Username *').fill('joel');
    
    // Click forgot password link
    const forgotPasswordLink = page.getByRole('button', { name: 'Reset password for entered username' });
    // Capture the API response to obtain the new password
    const waitForReset = page.waitForResponse(resp => resp.url().includes('/api/forgot-password') && resp.request().method() === 'POST');
    await forgotPasswordLink.click();
    const resetResponse = await waitForReset;
    const resetJson = await resetResponse.json();
    const newPassword = resetJson.newPassword;
    
    // Should show success message
    await expect(page.getByTestId('login-error')).toBeVisible();
    await expect(page.getByTestId('login-error')).toHaveText(/Password has been reset for 'joel'/);
    
    // Now login with the newly generated password using ARIA roles
    await page.getByLabel('Password *').fill('');
    await page.getByLabel('Password *').fill(newPassword);
    await page.getByRole('button', { name: 'Sign in to your account' }).click();
    
    // Verify successful login via header ARIA link and URL
    await expect(page).toHaveURL('/list');
    const header = page.getByRole('banner');
    await expect(header.getByRole('link', { name: 'You are logged in - click to logout' })).toBeVisible();
  });

  test('should not make request when username is empty', async ({ page }) => {
    await page.goto('/login');
    
    // Don't enter username, just click forgot password
    const forgotPasswordLink = page.getByRole('button', { name: 'Reset password for entered username' });
    
    // Should be disabled
    await expect(forgotPasswordLink).toBeDisabled();
    
    // Try to click (should not work)
    await forgotPasswordLink.click({ force: true });
    
    // Should not show any error message element
    await expect(page.getByTestId('login-error')).toHaveCount(0);
  });

  test('should handle non-existent username gracefully', async ({ page }) => {
    await page.goto('/login');
    
    // Enter non-existent username
    await page.getByLabel('Username *').fill('nonexistent');
    
    // Click forgot password link
    const forgotPasswordLink = page.getByRole('button', { name: 'Reset password for entered username' });
    await forgotPasswordLink.click();
    
    // Should show error message
    await expect(page.getByTestId('login-error')).toBeVisible();
    await expect(page.getByTestId('login-error')).toHaveText(/User not found/);
  });

  test('should handle network errors gracefully (forgot password)', async ({ page }) => {
    await page.goto('/login');
    
    // Enter username
    await page.getByLabel('Username *').fill('joel');
    
    // Mock network failure
    await page.route('**/api/forgot-password', route => route.abort());
    
    // Click forgot password link
    const forgotPasswordLink = page.getByRole('button', { name: 'Reset password for entered username' });
    await forgotPasswordLink.click();
    
    // Should show network error message
    await expect(page.getByTestId('login-error')).toBeVisible();
    await expect(page.getByTestId('login-error')).toHaveText(/Network error/);
  });

  test('should disable forgot password link during loading', async ({ page }) => {
    await page.goto('/login');
    
    // Enter username
    await page.getByLabel('Username *').fill('joel');
    
    const forgotPasswordLink = page.getByRole('button', { name: 'Reset password for entered username' });
    
    // Should be enabled initially
    await expect(forgotPasswordLink).toBeEnabled();
    
    // Mock slow response
    await page.route('**/api/forgot-password', async route => {
      await new Promise(resolve => setTimeout(resolve, 1000));
      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({ success: true, newPassword: 'test123' })
      });
    });
    
    // Click forgot password link
    await forgotPasswordLink.click();
    
    // Should be disabled during request (briefly)
    await expect(forgotPasswordLink).toBeDisabled();
    
    // Wait for response
    await page.waitForTimeout(1500);
    
    // Should be enabled again
    await expect(forgotPasswordLink).toBeEnabled();
  });

  test('should show create account button with proper ARIA roles', async ({ page }) => {
    await page.goto('/login');
    
    // Should show login form container
    await expect(page.getByTestId('login-form-container')).toBeVisible();
    
    // Should show login sidebar
    await expect(page.getByTestId('login-sidebar')).toBeVisible();
    
    // Should show vertical separator
    await expect(page.getByTestId('vertical-separator')).toBeVisible();
    
    // Should show sidebar actions
    await expect(page.getByTestId('sidebar-actions')).toBeVisible();
    
    // Should show create account section
    await expect(page.getByTestId('create-account-section')).toBeVisible();
    
    // Should show create account button
    const createAccountButton = page.getByRole('button', { name: 'Create new user account' });
    await expect(createAccountButton).toBeVisible();
    await expect(createAccountButton).toHaveText('Create Account');
    await expect(createAccountButton).toHaveAttribute('data-testid', 'create-account-button');
    await expect(createAccountButton).toHaveClass('hello-button create-account-button');
  });

  test('should show create account form when button is clicked', async ({ page }) => {
    await page.goto('/login');
    
    // Click create account button
    const createAccountButton = page.getByRole('button', { name: 'Create new user account' });
    await createAccountButton.click();
    
    // Should show create account form
    await expect(page.getByTestId('login-title')).toHaveText('Create Account');
    await expect(page.getByTestId('login-description')).toHaveText('Create a new account to access your training sessions');
    await expect(page.getByTestId('create-account-form')).toBeVisible();
    
    // Should show form inputs
    await expect(page.getByLabel('Username *')).toBeVisible();
    await expect(page.getByLabel('Password *')).toBeVisible();
    
    // Should show form buttons
    await expect(page.getByRole('button', { name: 'Create new account' })).toBeVisible();
    await expect(page.getByRole('button', { name: 'Back to login form' })).toBeVisible();
    
    // Login sidebar should be hidden
    await expect(page.getByTestId('login-sidebar')).not.toBeVisible();
  });

  test('should have proper ARIA roles for create account form', async ({ page }) => {
    await page.goto('/login');
    
    // Click create account button
    await page.getByRole('button', { name: 'Create new user account' }).click();
    
    // Check main element has correct aria-label
    const main = page.getByRole('main', { name: 'Create account form' });
    await expect(main).toBeVisible();
    
    // Check form has correct role
    const createAccountForm = page.getByRole('form', { name: 'Create Account Form' });
    await expect(createAccountForm).toBeVisible();
    
    // Check inputs have proper labels
    const usernameInput = page.getByLabel('Username *');
    await expect(usernameInput).toHaveAttribute('aria-required', 'true');
    await expect(usernameInput).toHaveAttribute('data-testid', 'create-username-input');
    
    const passwordInput = page.getByLabel('Password *');
    await expect(passwordInput).toHaveAttribute('aria-required', 'true');
    await expect(passwordInput).toHaveAttribute('data-testid', 'create-password-input');
    
    // Check buttons have proper roles
    const submitButton = page.getByRole('button', { name: 'Create new account' });
    await expect(submitButton).toHaveAttribute('role', 'button');
    await expect(submitButton).toHaveAttribute('data-testid', 'create-account-submit');
    
    const backButton = page.getByRole('button', { name: 'Back to login form' });
    await expect(backButton).toHaveAttribute('role', 'button');
    await expect(backButton).toHaveAttribute('data-testid', 'create-account-back');
  });

  test('should create account successfully with new username', async ({ page }) => {
    await page.goto('/login');
    
    // Click create account button
    await page.getByRole('button', { name: 'Create new user account' }).click();
    
    // Fill out the form
    const timestamp = Date.now();
    const uniqueUsername = `testuser${timestamp}`;
    
    await page.getByLabel('Username *').fill(uniqueUsername);
    await page.getByLabel('Password *').fill('testpassword123');
    
    // Submit form
    await page.getByRole('button', { name: 'Create new account' }).click();
    
    // Should show success message
    await expect(page.getByTestId('login-error')).toBeVisible();
    await expect(page.getByTestId('login-error')).toHaveText(`Account created successfully for '${uniqueUsername}'. You can now log in.`);
    
    // Should return to login form
    await expect(page.getByTestId('login-title')).toHaveText('Login');
    await expect(page.getByTestId('create-account-form')).not.toBeVisible();
  });

  test('should show error when username already exists', async ({ page }) => {
    await page.goto('/login');
    
    // Click create account button
    await page.getByRole('button', { name: 'Create new user account' }).click();
    
    // Try to create account with existing username
    await page.getByLabel('Username *').fill('joel');
    await page.getByLabel('Password *').fill('newpassword123');
    
    // Submit form
    await page.getByRole('button', { name: 'Create new account' }).click();
    
    // Should show error message
    await expect(page.getByTestId('login-error')).toBeVisible();
    await expect(page.getByTestId('login-error')).toHaveText('Username already exists');
  });

  test('should validate required fields', async ({ page }) => {
    await page.goto('/login');
    
    // Click create account button
    await page.getByRole('button', { name: 'Create new user account' }).click();
    
    const submitButton = page.getByRole('button', { name: 'Create new account' });
    
    // Should be disabled initially (no fields filled)
    await expect(submitButton).toBeDisabled();
    
    // Fill only username
    await page.getByLabel('Username *').fill('testuser');
    
    // Should still be disabled (missing password)
    await expect(submitButton).toBeDisabled();
    
    // Fill password
    await page.getByLabel('Password *').fill('testpass');
    
    // Should be enabled now
    await expect(submitButton).toBeEnabled();
  });

  test('should return to login form when back button is clicked', async ({ page }) => {
    await page.goto('/login');
    
    // Click create account button
    await page.getByRole('button', { name: 'Create new user account' }).click();
    
    // Should be on create account form
    await expect(page.getByTestId('create-account-form')).toBeVisible();
    
    // Click back button
    await page.getByRole('button', { name: 'Back to login form' }).click();
    
    // Should return to login form
    await expect(page.getByTestId('login-title')).toHaveText('Login');
    await expect(page.getByTestId('create-account-form')).not.toBeVisible();
    await expect(page.getByTestId('login-sidebar')).toBeVisible();
  });

  test('should handle network errors gracefully (create account)', async ({ page }) => {
    await page.goto('/login');
    
    // Click create account button
    await page.getByRole('button', { name: 'Create new user account' }).click();
    
    // Fill out the form
    await page.getByLabel('Username *').fill('testuser');
    await page.getByLabel('Password *').fill('testpass');
    
    // Mock network failure
    await page.route('**/api/create-account', route => route.abort());
    
    // Submit form
    await page.getByRole('button', { name: 'Create new account' }).click();
    
    // Should show network error message
    await expect(page.getByTestId('login-error')).toBeVisible();
    await expect(page.getByTestId('login-error')).toHaveText('Network error. Please try again.');
  });

  test('should disable form during loading', async ({ page }) => {
    await page.goto('/login');
    
    // Click create account button
    await page.getByRole('button', { name: 'Create new user account' }).click();
    
    // Fill out the form
    await page.getByLabel('Username *').fill('testuser');
    await page.getByLabel('Password *').fill('testpass');
    
    const submitButton = page.getByRole('button', { name: 'Create new account' });
    const usernameInput = page.getByLabel('Username *');
    const passwordInput = page.getByLabel('Password *');
    const backButton = page.getByRole('button', { name: 'Back to login form' });
    
    // Mock slow response
    await page.route('**/api/create-account', async route => {
      await new Promise(resolve => setTimeout(resolve, 1000));
      await route.fulfill({
        status: 201,
        contentType: 'application/json',
        body: JSON.stringify({ success: true, message: 'Account created successfully' })
      });
    });
    
    // Submit form
    await submitButton.click();
    
    // Should be disabled during request
    await expect(submitButton).toBeDisabled();
    await expect(submitButton).toHaveText('Creating Account...');
    await expect(usernameInput).toBeDisabled();
    await expect(passwordInput).toBeDisabled();
    await expect(backButton).toBeDisabled();
    
    // Wait for response
    await page.waitForTimeout(1500);
    
    // After success, UI should return to Login view
    await expect(page.getByTestId('login-title')).toHaveText('Login');
    await expect(page.getByTestId('create-account-form')).not.toBeVisible();
    await expect(page.getByTestId('login-form')).toBeVisible();
  });
});
