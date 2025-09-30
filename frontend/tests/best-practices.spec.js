import { test, expect } from '@playwright/test';

test.describe('Best Practices Page', () => {
  test('should display best practices content with proper accessibility', async ({ page }) => {
    await page.goto('/best-practices');
    
    // Check page title and description
    await expect(page.getByRole('heading', { name: 'Testing Best Practices', level: 1 })).toBeVisible();
    await expect(page.getByText('Follow these TestingLibrary patterns for accessible and maintainable tests')).toBeVisible();
    
    // Check navigation
    await expect(page.getByRole('button', { name: 'Go back to home page' })).toBeVisible();
    
    // Check main content structure
    await expect(page.locator('[role="main"]')).toBeVisible();
    await expect(page.locator('[aria-labelledby="practices-heading"]')).toBeVisible();
  });

  test('should display all practice sections with proper headings', async ({ page }) => {
    await page.goto('/best-practices');
    
    // Check all practice section headings
    await expect(page.getByRole('heading', { name: '1. Use TestingLibrary Pattern: Queries Accessible to Everyone' })).toBeVisible();
    await expect(page.getByRole('heading', { name: '2. Semantic Queries' })).toBeVisible();
    await expect(page.getByRole('heading', { name: '3. Test IDs (Last Resort)' })).toBeVisible();
    await expect(page.getByRole('heading', { name: '4. Best Practices Summary' })).toBeVisible();
  });

  test('should display getByRole examples with code highlighting', async ({ page }) => {
    await page.goto('/best-practices');
    
    // Check getByRole section
    await expect(page.getByRole('heading', { name: 'getByRole' })).toBeVisible();
    await expect(page.getByText('This can be used to query every element that is exposed in the accessibility tree')).toBeVisible();
    
    // Check code examples are visible (with syntax highlighting) for await example
    const awaitExample = page.getByTestId('bp-await-expect');
    await expect(awaitExample).toBeVisible();
    await expect(awaitExample.getByText(/await expect\(page\.getByRole/)).toBeVisible();
    await expect(page.getByText(/await page\.getByRole.*Create training session/)).toBeVisible();
  });

  test('should display getByLabel examples for form fields', async ({ page }) => {
    await page.goto('/best-practices');
    
    // Check getByLabel section
    await expect(page.getByRole('heading', { name: 'getByLabelText' })).toBeVisible();
    await expect(page.getByText('This method is really good for form fields')).toBeVisible();
    
    // Check code examples (with syntax highlighting)
    await expect(page.getByText(/await page\.getByLabel.*Session Title/)).toBeVisible();
    await expect(page.getByText(/await page\.getByLabel.*Status/)).toBeVisible();
  });

  test('should display priority order list correctly', async ({ page }) => {
    await page.goto('/best-practices');
    
    // Check priority list section
    await expect(page.getByRole('heading', { name: 'Priority Order' })).toBeVisible();
    
    // Check list items
    await expect(page.getByText('getByRole - Best for interactive elements')).toBeVisible();
    await expect(page.getByText('getByLabelText - Best for form fields')).toBeVisible();
    await expect(page.getByText('getByTestId - Last resort only')).toBeVisible();
  });

  test('should display benefits list with proper formatting', async ({ page }) => {
    await page.goto('/best-practices');
    
    // Check benefits section
    await expect(page.getByRole('heading', { name: 'Why This Matters' })).toBeVisible();
    
    // Check benefit items
    await expect(page.getByText('Tests reflect how users actually interact with your app')).toBeVisible();
    await expect(page.getByText('Accessibility issues become test failures')).toBeVisible();
    await expect(page.getByText('Compliance with accessibility standards')).toBeVisible();
  });

  test('should have proper code syntax highlighting', async ({ page }) => {
    await page.goto('/best-practices');
    
    // Check that code blocks are properly styled
    const codeBlocks = page.locator('.code-example');
    await expect(codeBlocks.first()).toBeVisible();
    
    // Check code block styling
    await expect(page.locator('.code-example pre').first()).toBeVisible();
    await expect(page.locator('.code-example code').first()).toBeVisible();
  });

  test('should be responsive on different viewport sizes', async ({ page }) => {
    // Test mobile viewport
    await page.setViewportSize({ width: 375, height: 667 });
    await page.goto('/best-practices');
    
    // Check content is still visible on mobile
    await expect(page.getByRole('heading', { name: 'Testing Best Practices', level: 1 })).toBeVisible();
    await expect(page.getByRole('button', { name: 'Go back to home page' })).toBeVisible();
    
    // Test desktop viewport
    await page.setViewportSize({ width: 1920, height: 1080 });
    await page.goto('/best-practices');
    
    // Check content is still visible on desktop
    await expect(page.getByRole('heading', { name: 'Testing Best Practices', level: 1 })).toBeVisible();
    await expect(page.getByRole('button', { name: 'Go back to home page' })).toBeVisible();
  });

  test('should navigate back to home page correctly', async ({ page }) => {
    await page.goto('/best-practices');
    
    // Click back button
    await page.getByRole('button', { name: 'Go back to home page' }).click();
    
    // Should be on home page
    await expect(page).toHaveURL('/');
    await expect(page.getByRole('heading', { name: 'Hello Champions!' })).toBeVisible();
  });
});
