import { test, expect } from '@playwright/test';

test.describe('Accessibility and Navigation Tests', () => {
  test('should have proper accessibility roles on home page', async ({ page }) => {
    await page.goto('/');
    
    // Check main application role
    await expect(page.locator('[role="application"]')).toBeVisible();
    
    // Home page should NOT have a banner (header) - it's the intro page
    await expect(page.locator('[role="banner"]')).not.toBeVisible();
    
    // Check button role and aria-label
    const button = page.locator('[role="button"]');
    await expect(button).toBeVisible();
    await expect(button).toHaveAttribute('aria-label', 'Let\'s start training sessions');
  });

  test('should navigate to list page when button is clicked', async ({ page }) => {
    await page.goto('/');
    
    // Click the button
    await page.click('[role="button"]');
    
    // Should navigate to list page
    await expect(page).toHaveURL('/list');
  });

  test('should have proper accessibility roles on list page', async ({ page }) => {
    await page.goto('/list');
    
    // Wait for the page to load and data to be fetched
    await page.waitForSelector('[role="main"]');
    
    // Check main role
    await expect(page.locator('[role="main"]')).toBeVisible();
    
    // Check page navigation (specifically the list page navigation, not the header)
    await expect(page.getByTestId('list-page-nav')).toBeVisible();
    
    // Wait for the list to be populated with data
    await page.waitForSelector('[role="list"]');
    
    // Check list role
    await expect(page.locator('[role="list"]')).toBeVisible();
    
    // Wait for list items to load (wait for at least one to appear)
    await page.waitForSelector('[role="listitem"]');
    
    // Check list items (wait for at least one, then check count)
    const listItems = page.locator('[role="listitem"]');
    await expect(await listItems.count()).toBeGreaterThan(0);
    
    // Check articles (should match list items count)
    const articles = page.locator('[role="article"]');
    await expect(await articles.count()).toBeGreaterThan(0);
    
    // Check status roles (should match list items count)
    const statusElements = page.locator('[role="status"]');
    await expect(await statusElements.count()).toBeGreaterThan(0);
  });


  test('should navigate to add session page from list page', async ({ page }) => {
    await page.goto('/list');
    
    // Wait for the page to load
    await page.waitForSelector('[role="main"]');
    
    // Click add session button
    await page.click('[aria-label="Add new training session"]');
    
    // Should navigate to add session page
    await expect(page).toHaveURL('/add');
  });


  test('should have proper accessibility roles on add session page', async ({ page }) => {
    await page.goto('/add');
    
    // Check main role
    await expect(page.locator('[role="main"]')).toBeVisible();
    
    // Check form role
    await expect(page.locator('[role="form"]')).toBeVisible();
    
    // Check main aria-label (the form aria-label is on the main element)
    await expect(page.locator('[role="main"]')).toHaveAttribute('aria-label', 'Add training session form');
    
    // Check input fields have proper labels
    const titleInput = page.getByLabel('Session Title');
    await expect(titleInput).toBeVisible();
    await expect(titleInput).toHaveAttribute('aria-required', 'true');
    
    const descriptionInput = page.getByLabel('Description');
    await expect(descriptionInput).toBeVisible();
    
    const statusSelect = page.getByLabel('Status *');
    await expect(statusSelect).toBeVisible();
    await expect(statusSelect).toHaveAttribute('aria-required', 'true');
    
    const durationInput = page.getByLabel('Duration (hours)');
    await expect(durationInput).toBeVisible();
    
    // Check submit button
    const submitButton = page.getByRole('button', { name: 'Create training session' });
    await expect(submitButton).toBeVisible();
    // native button already has button role, no need to assert explicit attribute
    
    // Check back button
    const backButton = page.getByRole('button', { name: 'Cancel and return to list' });
    await expect(backButton).toBeVisible();
    // native button already has button role, no need to assert explicit attribute
  });

  test('should have proper header accessibility on non-intro pages', async ({ page }) => {
    // Navigate to list page (should show header)
    await page.goto('/list');
    
    // Check header banner role
    const header = page.getByRole('banner');
    await expect(header).toBeVisible();
    await expect(header).toHaveAttribute('aria-label', 'Application Navigation Header');
    
    // Check navigation element
    const nav = header.getByRole('navigation');
    await expect(nav).toBeVisible();
    await expect(nav).toHaveAttribute('aria-label', 'Main navigation');
    
    // Check link structure within navigation
    const menu = nav.locator('.nav-menu');
    await expect(menu).toBeVisible();
    await expect(menu).toHaveAttribute('aria-label', 'Main Menu');

    // Check all navigation links
    const links = nav.getByRole('link');
    await expect(links).toHaveCount(6);

    // Verify link accessibility
    await expect(links.filter({ hasText: 'Home' })).toHaveAttribute('aria-label', 'Go to Home page');
    await expect(links.filter({ hasText: 'Sessions' })).toHaveAttribute('aria-label', 'View Training Sessions List');
    await expect(links.filter({ hasText: 'Health' })).toHaveAttribute('aria-label', 'Check Backend Health Status');
    await expect(links.filter({ hasText: 'Best Practices' })).toHaveAttribute('aria-label', 'View Testing Best Practices');
    // Login link should be present when not logged in
    const loginLink = links.filter({ hasText: 'Login' });
    await expect(loginLink).toHaveAttribute('aria-label', 'Sign in to your account');
  });

  test('should not show header on intro page', async ({ page }) => {
    await page.goto('/');
    
    // Header should not be visible on intro page
    const header = page.getByRole('banner');
    await expect(header).not.toBeVisible();
  });

  test('should have proper health page accessibility', async ({ page }) => {
    await page.goto('/health');
    
    // Wait for the page to load
    await page.waitForSelector('[role="main"]');
    
    // Check main role
    const main = page.getByRole('main');
    await expect(main).toBeVisible();
    await expect(main).toHaveAttribute('aria-label', 'Backend Health Monitoring Page');
    
    // Check page title (it's outside the main element)
    const title = page.getByRole('heading', { name: 'Backend Health Monitor' });
    await expect(title).toBeVisible();
    await expect(title).toHaveText('Backend Health Monitor');
    
    // Check status section
    const statusSection = page.getByRole('status');
    await expect(statusSection).toBeVisible();
    await expect(statusSection).toHaveAttribute('aria-live', 'polite');
    await expect(statusSection).toHaveAttribute('aria-label', 'Backend connection status');
    
    // Check status indicator
    const statusIndicator = statusSection.locator('.status-indicator');
    await expect(statusIndicator).toBeVisible();
    
    // Check info section
    const infoSection = page.locator('.health-info');
    const infoTitle = infoSection.getByRole('heading', { level: 2 });
    await expect(infoTitle).toBeVisible();
    await expect(infoTitle).toHaveText('What this means:');
    
    // Check info list
    const infoList = infoSection.getByRole('list');
    await expect(infoList).toBeVisible();
    
    // Check list items
    const listItems = infoList.getByRole('listitem');
    await expect(listItems).toHaveCount(3);
    
    // Wait for back button to appear
    await page.waitForSelector('[role="button"][aria-label="Go back to home page"]');
    
    // Check back button
    const backButton = page.getByRole('button', { name: 'Go back to home page' });
    await expect(backButton).toBeVisible();
    await expect(backButton).toHaveAttribute('role', 'button');
  });

  test('should have proper navigation between all pages with header', async ({ page }) => {
    // Start on list page
    await page.goto('/list');
    
    // Should have header
    const header = page.getByRole('banner');
    await expect(header).toBeVisible();
    
    // Navigate to health page via header
    const nav = header.getByRole('navigation');
    await nav.getByRole('link', { name: 'Check Backend Health Status' }).click();
    await expect(page).toHaveURL('/health');
    
    // Should still have header
    await expect(header).toBeVisible();
    
    // Navigate to home page via header
    await nav.getByRole('link', { name: 'Go to Home page' }).click();
    await expect(page).toHaveURL('/');
    
    // Should not have header on home page
    await expect(header).not.toBeVisible();
  });

  test('should have proper active page indication in header', async ({ page }) => {
    // Navigate to list page
    await page.goto('/list');
    
    const nav = page.getByRole('navigation');
    
    // Sessions link should be active
    const sessionsLink = nav.getByRole('link', { name: 'View Training Sessions List' });
    await expect(sessionsLink).toHaveAttribute('aria-current', 'page');
    
    // Navigate to health page
    await page.goto('/health');
    
    // Health link should be active
    const healthLink = nav.getByRole('link', { name: 'Check Backend Health Status' });
    await expect(healthLink).toHaveAttribute('aria-current', 'page');
  });
});
