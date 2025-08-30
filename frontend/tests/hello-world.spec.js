import { test, expect } from '@playwright/test';

test.describe('Hello World Page', () => {
  test('should display hello world message', async ({ page }) => {
    // Navigate to the home page
    await page.goto('/');
    
    // Check that the main heading is displayed
    await expect(page.getByRole('heading', { name: 'Hello Champions!' })).toBeVisible();
    
    // Check that the welcome message is present
    await expect(page.getByText('Welcome to the Playwright Training')).toBeVisible();
  });

  test('should have a clickable button with proper accessibility', async ({ page }) => {
    // Navigate to the home page
    await page.goto('/');
    
    // Check that the button is visible and clickable with proper accessibility
    const button = page.getByRole('button', { name: 'Let\'s start training sessions' });
    await expect(button).toBeVisible();
    await expect(button).toBeEnabled();
    
    // Check that the button has proper accessibility attributes
    await expect(button).toHaveAttribute('aria-label', 'Let\'s start training sessions');
    await expect(button).toHaveAttribute('role', 'button');
    
    // Test clicking the button
    await button.click();
    
    // Should navigate to list page
    await expect(page).toHaveURL('/list');
  });

  test('should have proper page structure and accessibility roles', async ({ page }) => {
    // Navigate to the home page
    await page.goto('/');
    
    // Check that the page has the correct structure
    await expect(page.locator('[role="application"]')).toBeVisible();
    
    // Home page should NOT have a banner (header) - it's the intro page
    await expect(page.locator('[role="banner"]')).not.toBeVisible();
    
    // Check that the button has the correct class
    await expect(page.locator('.hello-button')).toBeVisible();
    
    // Check that the button text is correct
    const button = page.getByRole('button', { name: 'Let\'s start training sessions' });
    await expect(button).toHaveText('Let\'s Start!');
  });

  test('should be responsive', async ({ page }) => {
    // Test on mobile viewport
    await page.setViewportSize({ width: 375, height: 667 });
    await page.goto('/');
    
    // Check that content is still visible on mobile
    await expect(page.getByRole('heading', { name: 'Hello Champions!' })).toBeVisible();
    await expect(page.getByText('Welcome to the Playwright Training')).toBeVisible();
    await expect(page.getByRole('button', { name: 'Let\'s start training sessions' })).toBeVisible();
    
    // Test on desktop viewport
    await page.setViewportSize({ width: 1920, height: 1080 });
    await page.goto('/');
    
    // Check that content is still visible on desktop
    await expect(page.getByRole('heading', { name: 'Hello Champions!' })).toBeVisible();
    await expect(page.getByText('Welcome to the Playwright Training')).toBeVisible();
    await expect(page.getByRole('button', { name: 'Let\'s start training sessions' })).toBeVisible();
  });
}); 