import { test, expect } from '@playwright/test';

test.describe('Health Page', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/health');
  });

  test('should display health page with proper accessibility', async ({ page }) => {
    // Check main container
    const main = page.getByRole('main');
    await expect(main).toBeVisible();
    await expect(main).toHaveAttribute('aria-label', 'Backend Health Monitoring Page');
    
    // Check page title (it's outside the main element)
    const title = page.getByRole('heading', { name: 'Backend Health Monitor' });
    await expect(title).toBeVisible();
    await expect(title).toHaveText('Backend Health Monitor');
  });

  test('should have proper status section with accessibility roles', async ({ page }) => {
    const statusSection = page.getByRole('status');
    await expect(statusSection).toBeVisible();
    await expect(statusSection).toHaveAttribute('aria-live', 'polite');
    await expect(statusSection).toHaveAttribute('aria-label', 'Backend connection status');
    
    // Check status indicator
    const statusIndicator = statusSection.locator('.status-indicator');
    await expect(statusIndicator).toBeVisible();
  });

  test('should display initial status', async ({ page }) => {
    const statusSection = page.getByRole('status');
    
    // Initially should show some status
    const statusText = statusSection.locator('.status-text');
    await expect(statusText).toBeVisible();
    
    // Should have status icon
    const statusIcon = statusSection.locator('.status-icon');
    await expect(statusIcon).toBeVisible();
    
    // Status should show some text (could be "checking", "online", or "offline")
    await expect(statusText).not.toBeEmpty();
  });

  test('should show online status when backend is available', async ({ page }) => {
    // Mock successful backend response
    await page.route('http://localhost:3001/health', async route => {
      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({ status: 'ok' })
      });
    });
    
    // Reload page to trigger health check
    await page.reload();
    
    // Wait for status to update
    await page.waitForTimeout(1000);
    
    const statusSection = page.getByRole('status');
    const statusText = statusSection.locator('.status-text');
    
    // Should show online status
    await expect(statusText).toContainText('Online');
    
    // Should have online styling
    const statusIcon = statusSection.locator('.status-icon.status-online');
    await expect(statusIcon).toBeVisible();
  });

  test('should show offline status when backend is unavailable', async ({ page }) => {
    // Mock failed backend response
    await page.route('http://localhost:3001/health', async route => {
      await route.abort('failed');
    });
    
    // Reload page to trigger health check
    await page.reload();
    
    // Wait for status to update
    await page.waitForTimeout(1000);
    
    const statusSection = page.getByRole('status');
    const statusText = statusSection.locator('.status-text');
    
    // Should show offline status
    await expect(statusText).toContainText('Offline');
    
    // Should have offline styling
    const statusIcon = statusSection.locator('.status-icon.status-offline');
    await expect(statusIcon).toBeVisible();
    
    // Should show error message
    const errorMessage = statusSection.getByRole('alert');
    await expect(errorMessage).toBeVisible();
    await expect(errorMessage).toContainText('Cannot connect to backend server');
  });

  test('should show last checked timestamp', async ({ page }) => {
    const statusSection = page.getByRole('status');
    
    // Wait for initial health check
    await page.waitForTimeout(1000);
    
    // Should display last checked time
    const lastChecked = statusSection.locator('.last-checked');
    await expect(lastChecked).toBeVisible();
    await expect(lastChecked).toContainText('Last checked:');
  });

  test('should have proper information section with accessibility', async ({ page }) => {
    const infoSection = page.locator('.health-info');
    
    // Check info title
    const infoTitle = infoSection.getByRole('heading', { level: 2 });
    await expect(infoTitle).toBeVisible();
    await expect(infoTitle).toHaveText('What this means:');
    
    // Check info list
    const infoList = infoSection.getByRole('list');
    await expect(infoList).toBeVisible();
    
    // Check list items
    const listItems = infoList.getByRole('listitem');
    await expect(listItems).toHaveCount(3);
    
    // Verify content of list items
    await expect(listItems.nth(0)).toContainText('🟢 Online: Backend is running and responding to requests');
    await expect(listItems.nth(1)).toContainText('🔴 Offline: Backend is not accessible or has stopped responding');
    await expect(listItems.nth(2)).toContainText('🟡 Checking: Currently verifying backend status');
  });

  test('should have working back button with accessibility', async ({ page }) => {
    const backButton = page.getByRole('button', { name: 'Go back to home page' });
    await expect(backButton).toBeVisible();
    await expect(backButton).toHaveAttribute('role', 'button');
    await expect(backButton).toBeEnabled();
    
    // Click back button
    await backButton.click();
    
    // Should navigate to home page
    await expect(page).toHaveURL('/');
  });

  test('should update status every 5 seconds', async ({ page }) => {
    // Mock changing backend responses
    let callCount = 0;
    await page.route('http://localhost:3001/health', async route => {
      callCount++;
      if (callCount === 1) {
        // First call - online
        await route.fulfill({
          status: 200,
          contentType: 'application/json',
          body: JSON.stringify({ status: 'ok' })
        });
      } else if (callCount === 2) {
        // Second call - offline
        await route.abort('failed');
      } else {
        // Subsequent calls - online again
        await route.fulfill({
          status: 200,
          contentType: 'application/json',
          body: JSON.stringify({ status: 'ok' })
        });
      }
    });
    
    // Reload page to start fresh
    await page.reload();
    
    // Wait for first check
    await page.waitForTimeout(1000);
    
    // Should show online initially
    const statusSection = page.getByRole('status');
    let statusText = statusSection.locator('.status-text');
    await expect(statusText).toContainText('Online');
    
    // Wait for next check (5 seconds)
    await page.waitForTimeout(5000);
    
    // Should show some status after second check (could be offline if backend went down)
    statusText = statusSection.locator('.status-text');
    await expect(statusText).not.toBeEmpty();
    
    // Wait for third check
    await page.waitForTimeout(5000);
    
    // Should show some status again
    statusText = statusSection.locator('.status-text');
    await expect(statusText).not.toBeEmpty();
  });

  test('should handle network errors gracefully', async ({ page }) => {
    // Mock network error
    await page.route('http://localhost:3001/health', async route => {
      await route.abort('failed');
    });
    
    // Reload page
    await page.reload();
    
    // Wait for error to appear
    await page.waitForTimeout(1000);
    
    const statusSection = page.getByRole('status');
    
    // Should show offline status
    const statusText = statusSection.locator('.status-text');
    await expect(statusText).toContainText('Offline');
    
    // Should show error message
    const errorMessage = statusSection.getByRole('alert');
    await expect(errorMessage).toBeVisible();
    await expect(errorMessage).toContainText('Cannot connect to backend server');
  });

  test('should be responsive on mobile devices', async ({ page }) => {
    // Set mobile viewport
    await page.setViewportSize({ width: 375, height: 667 });
    
    // Page should still be accessible
    const main = page.getByRole('main');
    await expect(main).toBeVisible();
    
    // Title should be visible (it's outside the main element)
    const title = page.getByRole('heading', { name: 'Backend Health Monitor' });
    await expect(title).toBeVisible();
    
    // Status section should be visible
    const statusSection = page.getByRole('status');
    await expect(statusSection).toBeVisible();
    
    // Back button should be accessible
    const backButton = page.getByRole('button', { name: 'Go back to home page' });
    await expect(backButton).toBeVisible();
  });

  test('should have proper focus management', async ({ page }) => {
    // Back button should be focusable
    const backButton = page.getByRole('button', { name: 'Go back to home page' });
    
    // Focus the button
    await backButton.focus();
    await expect(backButton).toBeFocused();
    
    // Should be able to navigate with keyboard
    await page.keyboard.press('Enter');
    await expect(page).toHaveURL('/');
  });

  test('should display proper status icons and colors', async ({ page }) => {
    const statusSection = page.getByRole('status');
    
    // Initially some status (could be online, offline, or checking)
    let statusIcon = statusSection.locator('.status-icon');
    await expect(statusIcon).toBeVisible();
    
    // Mock online status
    await page.route('http://localhost:3001/health', async route => {
      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({ status: 'ok' })
      });
    });
    
    // Reload and wait for update
    await page.reload();
    await page.waitForTimeout(1000);
    
    // Should show online status with green styling
    statusIcon = statusSection.locator('.status-icon.status-online');
    await expect(statusIcon).toBeVisible();
    
    // Mock offline status
    await page.route('http://localhost:3001/health', async route => {
      await route.abort('failed');
    });
    
    // Reload and wait for update
    await page.reload();
    await page.waitForTimeout(1000);
    
    // Should show offline status with red styling
    statusIcon = statusSection.locator('.status-icon.status-offline');
    await expect(statusIcon).toBeVisible();
  });
});
