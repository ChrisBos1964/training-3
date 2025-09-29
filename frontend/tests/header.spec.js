import { test, expect } from '@playwright/test';

test.describe('Header Component', () => {
  test.beforeEach(async ({ page }) => {
    // Navigate to a page that should show the header (not the intro page)
    await page.goto('/list');
  });

  test('should display header on non-intro pages', async ({ page }) => {
    // Header should be visible on list page
    const header = page.getByRole('banner');
    await expect(header).toBeVisible();
    
    // Header should contain the app title
    const title = header.getByRole('heading', { level: 1 });
    await expect(title).toHaveText('Training App');
  });

  test('should not display header on intro page', async ({ page }) => {
    // Navigate to intro page
    await page.goto('/');
    
    // Header should not be visible
    const header = page.getByRole('banner');
    await expect(header).not.toBeVisible();
  });

  test('should have proper accessibility roles and labels', async ({ page }) => {
    const header = page.getByRole('banner');
    
    // Check header accessibility attributes
    await expect(header).toHaveAttribute('aria-label', 'Application Navigation Header');
    
    // Check navigation element
    const nav = header.getByRole('navigation');
    await expect(nav).toHaveAttribute('aria-label', 'Main navigation');
    
    // Check menu structure (list with links)
    const menu = nav.locator('.nav-menu');
    await expect(menu).toHaveAttribute('aria-label', 'Main Menu');
  });

  test('should display all navigation menu items', async ({ page }) => {
    const nav = page.getByRole('navigation');
    
    // Check all links are present
    const links = nav.getByRole('link');
    await expect(links).toHaveCount(6);
    
    // Verify link texts
    await expect(links.nth(0)).toHaveText('Home');
    await expect(links.nth(1)).toHaveText('Sessions');
    await expect(links.nth(2)).toHaveText('Health');
    await expect(links.nth(3)).toHaveText('Best Practices');
    await expect(links.nth(4)).toHaveText('Shadow DOM');
    await expect(links.nth(5)).toHaveText('Login');
  });

  test('should highlight active page in navigation', async ({ page }) => {
    const nav = page.getByRole('navigation');
    
    // On list page, Sessions should be active
    const sessionsLink = nav.getByRole('link', { name: 'View Training Sessions List' });
    await expect(sessionsLink).toHaveAttribute('aria-current', 'page');
    
    // Other links should not have aria-current
    const homeLink = nav.getByRole('link', { name: 'Go to Home page' });
    await expect(homeLink).not.toHaveAttribute('aria-current');
  });

  test('should navigate to correct pages when menu items are clicked', async ({ page }) => {
    const nav = page.getByRole('navigation');
    
    // Test Home navigation
    await nav.getByRole('link', { name: 'Go to Home page' }).click();
    await expect(page).toHaveURL('/');
    
    // Navigate back to list page
    await page.goto('/list');
    
    // Test Health navigation
    await nav.getByRole('link', { name: 'Check Backend Health Status' }).click();
    await expect(page).toHaveURL('/health');
  });

  test('should have proper link accessibility attributes', async ({ page }) => {
    const nav = page.getByRole('navigation');
    
    // Check each link has proper accessibility attributes
    const links = nav.getByRole('link');
    
    for (let i = 0; i < 6; i++) {
      const link = links.nth(i);
      await expect(link).toHaveAttribute('aria-label');
      await expect(link).toBeEnabled();
    }
  });

  test('should be responsive on mobile devices', async ({ page }) => {
    // Set mobile viewport
    await page.setViewportSize({ width: 375, height: 667 });
    
    const header = page.getByRole('banner');
    await expect(header).toBeVisible();
    
    // Header should still contain all navigation items
    const nav = page.getByRole('navigation');
    const links = nav.getByRole('link');
    await expect(links).toHaveCount(6);
  });

  test('should maintain header visibility when navigating between pages', async ({ page }) => {
    // Start on list page (should have header)
    await page.goto('/list');
    let header = page.getByRole('banner');
    await expect(header).toBeVisible();
    
    // Navigate to health page (should still have header)
    await page.goto('/health');
    header = page.getByRole('banner');
    await expect(header).toBeVisible();
    
    // Navigate to home page (should not have header)
    await page.goto('/');
    header = page.getByRole('banner');
    await expect(header).not.toBeVisible();
  });

  test('should have proper focus management', async ({ page }) => {
    const nav = page.getByRole('navigation');
    
    // Focus should be manageable on all links
    const links = nav.getByRole('link');
    
    for (let i = 0; i < 6; i++) {
      const link = links.nth(i);
      await link.focus();
      await expect(link).toBeFocused();
    }
  });
});
