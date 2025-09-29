import { test, expect } from '@playwright/test';

test.describe('Add Session Page Tests', () => {
  test('should navigate to add session page from list page', async ({ page }) => {
    await page.goto('/list');
    
    // Check that the add button is visible
    const addButton = page.getByRole('button', { name: 'Add new training session' });
    await expect(addButton).toBeVisible();
    await expect(addButton).toBeEnabled();
    
    // Click the add button
    await addButton.click();
    
    // Should navigate to add page
    await expect(page).toHaveURL('/add');
  });

  test('should have proper accessibility roles on add session page', async ({ page }) => {
    await page.goto('/add');
    
    // Check main role
    await expect(page.locator('[role="main"]')).toBeVisible();
    
    // Check page navigation role (filter to get the page navigation, not the header navigation)
    await expect(page.locator('[role="navigation"]').filter({ hasText: '← Back to List' })).toBeVisible();
    
    // Check form role
    await expect(page.locator('[role="form"]')).toBeVisible();
    
    // Check back button (filter to get the specific back button)
    const backButton = page.locator('[role="button"]').filter({ hasText: '← Back to List' });
    await expect(backButton).toHaveAttribute('aria-label', 'Go back to training sessions list');
  });

  test('should have proper form structure and accessibility', async ({ page }) => {
    await page.goto('/add');
    
    // Check form labels and inputs
    const titleLabel = page.getByLabel('Session Title *');
    await expect(titleLabel).toBeVisible();
    
    const descriptionLabel = page.getByLabel('Description *');
    await expect(descriptionLabel).toBeVisible();
    
    const statusLabel = page.getByLabel('Status *');
    await expect(statusLabel).toBeVisible();
    
    const durationLabel = page.getByLabel('Duration (hours)');
    await expect(durationLabel).toBeVisible();
    
    // Check required fields
    const titleInput = page.getByRole('textbox', { name: 'Session Title *' });
    await expect(titleInput).toHaveAttribute('aria-required', 'true');
    
    const descriptionTextarea = page.getByRole('textbox', { name: 'Description *' });
    await expect(descriptionTextarea).toHaveAttribute('aria-required', 'true');
    
    const statusSelect = page.getByRole('combobox', { name: 'Status *' });
    await expect(statusSelect).toHaveAttribute('aria-required', 'true');
  });

  test('should have proper ARIA descriptions for form fields', async ({ page }) => {
    await page.goto('/add');
    
    // Check help text associations
    const titleInput = page.getByRole('textbox', { name: 'Session Title *' });
    await expect(titleInput).toHaveAttribute('aria-describedby', 'title-help');
    
    const descriptionTextarea = page.getByRole('textbox', { name: 'Description *' });
    await expect(descriptionTextarea).toHaveAttribute('aria-describedby', 'description-help');
    
    const statusSelect = page.getByRole('combobox', { name: 'Status *' });
    await expect(statusSelect).toHaveAttribute('aria-describedby', 'status-help');
    
    const durationInput = page.getByRole('spinbutton', { name: 'Duration (hours)' });
    await expect(durationInput).toHaveAttribute('aria-describedby', 'duration-help');
  });

  test('should have proper form actions', async ({ page }) => {
    await page.goto('/add');
    
    // Check submit button (should be disabled initially since form is empty)
    const submitButton = page.getByRole('button', { name: 'Create training session' });
    await expect(submitButton).toBeVisible();
    await expect(submitButton).toBeDisabled();
    
    // Check cancel button
    const cancelButton = page.getByRole('button', { name: 'Cancel' });
    await expect(cancelButton).toBeVisible();
    await expect(cancelButton).toBeEnabled();
  });

  test('should navigate back to list page when back button is clicked', async ({ page }) => {
    await page.goto('/add');
    
    // Click back button
    await page.click('[aria-label="Go back to training sessions list"]');
    
    // Should navigate back to list
    await expect(page).toHaveURL('/list');
  });

  test('should navigate back to list page when cancel button is clicked', async ({ page }) => {
    await page.goto('/add');
    
    // Click cancel button
    await page.click('[aria-label="Cancel and return to list"]');
    
    // Should navigate back to list
    await expect(page).toHaveURL('/list');
  });

  test('should handle form submission (currently just navigation)', async ({ page }) => {
    await page.goto('/add');
    
    // Fill out required fields
    await page.getByLabel('Session Title *').fill('Test Session');
    await page.getByLabel('Description *').fill('Test Description');
    await page.getByLabel('Status *').selectOption('Pending');
    
    // Wait for form to be valid (submit button should be enabled)
    await page.waitForSelector('[role="button"][aria-label="Create training session"]:not([disabled])');
    
    // Submit form
    await page.getByRole('button', { name: 'Create training session' }).click();
    
    // Should navigate back to list (since backend is not implemented)
    await expect(page).toHaveURL('/list');
  });

  test('should be responsive on different viewports', async ({ page }) => {
    // Test on mobile viewport
    await page.setViewportSize({ width: 375, height: 667 });
    await page.goto('/add');
    
    // Check that form elements are still accessible
    await expect(page.getByRole('form')).toBeVisible();
    await expect(page.getByLabel('Session Title *')).toBeVisible();
    
    // Test on desktop viewport
    await page.setViewportSize({ width: 1920, height: 1080 });
    await page.goto('/add');
    
    // Check that form elements are still accessible
    await expect(page.getByRole('form')).toBeVisible();
    await expect(page.getByLabel('Session Title *')).toBeVisible();
  });
});
