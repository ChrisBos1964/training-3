import { test, expect } from '@playwright/test';

test.describe('Hello World Page', () => {
  test('should display hello world message', async ({ page }) => {
    // Navigate to the home page
    await page.goto('/');
    
    // Check that the main heading is displayed
    await expect(page.getByRole('heading', { name: 'Hello Nationale Nederlanden!' })).toBeVisible();
    
    // Check that the welcome message is present
    await expect(page.getByText('Welcome to the Playwright Training')).toBeVisible();
  });

  test('should have a clickable button', async ({ page }) => {
    // Navigate to the home page
    await page.goto('/');
    
    // Check that the button is visible and clickable
    const button = page.getByRole('button', { name: 'Click me!' });
    await expect(button).toBeVisible();
    await expect(button).toBeEnabled();
    
    // Test clicking the button
    await button.click();
  });

  test('should have proper page structure', async ({ page }) => {
    // Navigate to the home page
    await page.goto('/');
    
    // Check that the page has the correct structure
    await expect(page.locator('.App')).toBeVisible();
    await expect(page.locator('.App-header')).toBeVisible();
    
    // Check that the button has the correct class
    await expect(page.locator('.hello-button')).toBeVisible();
  });

  test('should be responsive', async ({ page }) => {
    // Test on mobile viewport
    await page.setViewportSize({ width: 375, height: 667 });
    await page.goto('/');
    
    // Check that content is still visible on mobile
    await expect(page.getByRole('heading', { name: 'Hello Nationale Nederlanden!' })).toBeVisible();
    await expect(page.getByText('Welcome to the Playwright Training')).toBeVisible();
    await expect(page.getByRole('button', { name: 'Click me!' })).toBeVisible();
    
    // Test on desktop viewport
    await page.setViewportSize({ width: 1920, height: 1080 });
    await page.goto('/');
    
    // Check that content is still visible on desktop
    await expect(page.getByRole('heading', { name: 'Hello Nationale Nederlanden!' })).toBeVisible();
    await expect(page.getByText('Welcome to the Playwright Training')).toBeVisible();
    await expect(page.getByRole('button', { name: 'Click me!' })).toBeVisible();
  });
}); 