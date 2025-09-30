import { test, expect } from '@playwright/test';

test.describe('Frontend-Backend Integration Tests', () => {
  test('should create training session and display it in list', async ({ page }) => {
    await page.goto('/list');
    
    // Click add button
    await page.click('[aria-label="Add new training session"]');
    await expect(page).toHaveURL('/add');
    
    // Fill out the form
    await page.getByLabel('Session Title *').fill('Integration Test Session');
    await page.getByLabel('Description *').fill('This session is created via integration test');
    await page.getByLabel('Status *').selectOption('Pending');
    await page.getByLabel('Duration (hours)').fill('2.5');
    
    // Submit form
    await page.getByRole('button', { name: 'Create training session' }).click();
    
    // Should navigate back to list
    await expect(page).toHaveURL('/list');
    
    // Should see the new session in the list (use first() to avoid strict mode violations)
    await expect(page.getByText('Integration Test Session').first()).toBeVisible();
    await expect(page.getByText('This session is created via integration test').first()).toBeVisible();
    
    // Check for status and duration using more specific selectors
    const statusElement = page.locator('.status-badge').filter({ hasText: 'Pending' }).first();
    await expect(statusElement).toBeVisible();
    
    const durationElement = page.locator('.session-duration').filter({ hasText: 'Duration: 2.5 hours' }).first();
    await expect(durationElement).toBeVisible();
  });

  test('should handle form validation errors', async ({ page }) => {
    await page.goto('/add');
    
    // Submit button should be disabled initially (no required fields filled)
    const submitButton = page.getByRole('button', { name: 'Create training session' });
    await expect(submitButton).toBeDisabled();
    
    // Fill only title
    await page.getByLabel('Session Title *').fill('Partial Session');
    
    // Submit button should still be disabled (missing description and status)
    await expect(submitButton).toBeDisabled();
    
    // Fill description
    await page.getByLabel('Description *').fill('Now with description');
    
    // Submit button should still be disabled (missing status)
    await expect(submitButton).toBeDisabled();
    
    // Fill required status
    await page.getByLabel('Status *').selectOption('In Progress');
    
    // Submit button should now be enabled
    await expect(submitButton).toBeEnabled();
    
    // Submit should work now
    await submitButton.click();
    
    // Should navigate to list
    await expect(page).toHaveURL('/list');
  });

  test('should delete training session with two-step confirmation', async ({ page }) => {
    // Login to expose delete buttons
    await page.goto('/login');
    await page.getByLabel('Username *').fill('joel');
    await page.getByLabel('Password *').fill('grimberg');
    await page.getByRole('button', { name: 'Sign in to your account' }).click();
    
    // Wait for successful login redirect to list page
    await expect(page).toHaveURL('/list');
    
    // Create a session to delete
    const timestamp = Date.now();
    const sessionTitle = `Test Session to Delete ${timestamp}`;
    
    await page.click('[aria-label="Add new training session"]');
    await page.getByLabel('Session Title *').fill(sessionTitle);
    await page.getByLabel('Description *').fill('This session will be deleted');
    await page.getByLabel('Status *').selectOption('Pending');
    await page.getByRole('button', { name: 'Create training session' }).click();
    
    // Should be back on list and session visible
    await expect(page).toHaveURL('/list');
    const list = page.getByRole('list', { name: 'Training sessions' });
    await expect(list).toBeVisible();
    await expect(list.getByRole('listitem').filter({ hasText: sessionTitle }).first()).toBeVisible();
    
    // Find and click delete button for this specific session
    const sessionItem = list.getByRole('listitem').filter({ hasText: sessionTitle }).first();
    await expect(sessionItem).toBeVisible();
    const deleteButton = sessionItem.getByRole('button', { name: `Delete training session: ${sessionTitle}` });
    await expect(deleteButton).toBeVisible();
    await deleteButton.click();
    
    // First confirmation modal should appear
    await expect(page.locator('[role="dialog"]')).toBeVisible();
    await expect(page.locator('[aria-labelledby="delete-confirm-title"]')).toBeVisible();
    await expect(page.locator('[aria-describedby="delete-confirm-description"]')).toBeVisible();
    await expect(page.getByText('Are you sure you want to delete')).toBeVisible();
    
    // Wait for modal to be fully interactive
    await page.waitForSelector('[role="dialog"]', { state: 'visible' });
    await page.waitForSelector('[role="dialog"] button', { state: 'visible' });
    
    // Test cancel on first modal
    const cancelButton = page.getByRole('button', { name: 'Cancel deletion' });
    await expect(cancelButton).toBeVisible();
    await cancelButton.click();
    
    // Modal should disappear
    await expect(page.locator('[role="dialog"]')).not.toBeVisible();
    
    // Session should still be visible
    await expect(page.getByText(sessionTitle)).toBeVisible();
    
    // Now delete for real - open first modal again
    await deleteButton.click();
    await expect(page.locator('[role="dialog"]')).toBeVisible();
    
    // Click "Yes, Delete" to proceed to final confirmation
    const confirmButton = page.getByRole('button', { name: 'Yes, proceed to final confirmation' });
    await expect(confirmButton).toBeVisible();
    await confirmButton.click();
    
    // First modal should disappear, second modal should appear
    await expect(page.locator('[aria-labelledby="delete-confirm-title"]')).not.toBeVisible();
    await expect(page.locator('[aria-labelledby="final-delete-confirm-title"]')).toBeVisible();
    await expect(page.getByText('Final Confirmation')).toBeVisible();
    await expect(page.getByText('This action cannot be undone')).toBeVisible();
    
    // Test cancel on final confirmation modal
    const finalCancelButton = page.getByRole('button', { name: 'Cancel final deletion' });
    await expect(finalCancelButton).toBeVisible();
    await finalCancelButton.click();
    
    // Final modal should disappear, first modal should reappear
    await expect(page.locator('[aria-labelledby="final-delete-confirm-title"]')).not.toBeVisible();
    await expect(page.locator('[aria-labelledby="delete-confirm-title"]')).toBeVisible();
    
    // Now proceed with actual deletion from first modal
    const firstConfirmButton = page.getByRole('button', { name: 'Yes, proceed to final confirmation' });
    await expect(firstConfirmButton).toBeVisible();
    await firstConfirmButton.click();
    
    // Should proceed to final confirmation again
    await expect(page.locator('[aria-labelledby="final-delete-confirm-title"]')).toBeVisible();
    
    // Click "Yes, Delete Permanently" to actually delete
    const permanentDeleteButton = page.getByRole('button', { name: 'Yes, delete this training session permanently' });
    await expect(permanentDeleteButton).toBeVisible();
    await permanentDeleteButton.click();
    
    // Both modals should disappear and session should be gone
    await expect(page.locator('[role="dialog"]')).not.toBeVisible();
    await expect(page.getByText(sessionTitle)).not.toBeVisible();
    
    // Verify our specific session is gone
    await expect(page.locator('.session-item').filter({ hasText: sessionTitle })).not.toBeVisible();
  });

  test('should handle API errors gracefully', async ({ page }) => {
    // This test mocks API failures to test error handling
    await page.goto('/list');
    
    // Mock API failure by intercepting the request
    await page.route('http://localhost:3001/api/sessions', async route => {
      await route.fulfill({ status: 500, body: 'Internal Server Error' });
    });
    
    // Reload the page to trigger the mocked error
    await page.reload();
    
    // Should show error message
    await expect(page.getByRole('alert')).toBeVisible();
    await expect(page.getByText('Failed to load training sessions')).toBeVisible();
    
    // Should show retry button
    const retryButton = page.getByRole('button', { name: 'Retry' });
    await expect(retryButton).toBeVisible();
  });

  test('should create and delete multiple sessions', async ({ page }) => {
    // Login to expose edit/delete
    await page.goto('/login');
    await page.getByLabel('Username *').fill('joel');
    await page.getByLabel('Password *').fill('grimberg');
    await page.getByRole('button', { name: 'Sign in to your account' }).click();
    
    // Wait for successful login redirect to list page
    await expect(page).toHaveURL('/list');
    
    // Create first session with unique name
    const timestamp1 = Date.now();
    const firstSessionTitle = `First Test Session ${timestamp1}`;
    
    await page.click('[aria-label="Add new training session"]');
    await page.getByLabel('Session Title *').fill(firstSessionTitle);
    await page.getByLabel('Description *').fill('First session description');
    await page.getByLabel('Status *').selectOption('Pending');
    await page.getByRole('button', { name: 'Create training session' }).click();
    
    // Should be back on list
    await expect(page).toHaveURL('/list');
    await expect(page.getByRole('heading', { name: firstSessionTitle })).toBeVisible();
    
    // Create second session with unique name
    const timestamp2 = Date.now() + 1;
    const secondSessionTitle = `Second Test Session ${timestamp2}`;
    
    await page.click('[aria-label="Add new training session"]');
    await page.getByLabel('Session Title *').fill(secondSessionTitle);
    await page.getByLabel('Description *').fill('Second session description');
    await page.getByLabel('Status *').selectOption('In Progress');
    await page.getByRole('button', { name: 'Create training session' }).click();
    
    // Should be back on list with both sessions
    await expect(page).toHaveURL('/list');
    await expect(page.getByRole('heading', { name: firstSessionTitle })).toBeVisible();
    await expect(page.getByRole('heading', { name: secondSessionTitle })).toBeVisible();
    
    // Delete first session by finding its specific delete button
    const list = page.getByRole('list', { name: 'Training sessions' });
    const firstSessionItem = list.getByRole('listitem').filter({ hasText: firstSessionTitle });
    const firstDeleteButton = firstSessionItem.getByRole('button', { name: new RegExp(`^Delete training session: ${firstSessionTitle}$`) });
    await firstDeleteButton.click();
    
    // Wait for modal to be fully interactive
    await page.waitForSelector('[role="dialog"]', { state: 'visible' });
    await page.waitForSelector('[role="dialog"] button', { state: 'visible' });
    
    // Click "Yes, Delete" to proceed to final confirmation
    await page.getByRole('button', { name: 'Yes, proceed to final confirmation' }).click();
    
    // Wait for final confirmation modal and click "Yes, Delete Permanently"
    await page.waitForSelector('[role="dialog"]', { state: 'visible' });
    await page.getByRole('button', { name: 'Yes, delete this training session permanently' }).click();
    
    // First session should be gone, second should remain
    await expect(page.getByRole('heading', { name: firstSessionTitle })).not.toBeVisible();
    await expect(page.getByRole('heading', { name: secondSessionTitle })).toBeVisible();
    
    // Delete second session by finding its specific delete button
    const secondSessionItem = list.getByRole('listitem').filter({ hasText: secondSessionTitle });
    const secondDeleteButton = secondSessionItem.getByRole('button', { name: new RegExp(`^Delete training session: ${secondSessionTitle}$`) });
    await secondDeleteButton.click();
    
    // Wait for modal to be fully interactive
    await page.waitForSelector('[role="dialog"]', { state: 'visible' });
    await page.waitForSelector('[role="dialog"] button', { state: 'visible' });
    
    // Click "Yes, Delete" to proceed to final confirmation
    await page.getByRole('button', { name: 'Yes, proceed to final confirmation' }).click();
    
    // Wait for final confirmation modal and click "Yes, Delete Permanently"
    await page.waitForSelector('[role="dialog"]', { state: 'visible' });
    await page.getByRole('button', { name: 'Yes, delete this training session permanently' }).click();
    
    // Both sessions should be gone
    await expect(page.getByRole('heading', { name: firstSessionTitle })).not.toBeVisible();
    await expect(page.getByRole('heading', { name: secondSessionTitle })).not.toBeVisible();
    
    // Verify our specific sessions are gone (don't assume empty list)
    // The list might contain other sessions from other tests or initial data
    await expect(page.locator('.session-item').filter({ hasText: firstSessionTitle })).not.toBeVisible();
    await expect(page.locator('.session-item').filter({ hasText: secondSessionTitle })).not.toBeVisible();
  });

  test('should maintain accessibility during CRUD operations', async ({ page }) => {
    // Login first to enable CRUD operations
    await page.goto('/login');
    await page.getByLabel('Username *').fill('joel');
    await page.getByLabel('Password *').fill('grimberg');
    await page.getByRole('button', { name: 'Sign in to your account' }).click();
    
    // Wait for successful login redirect to list page
    await expect(page).toHaveURL('/list');
    
    // Check initial accessibility
    await expect(page.locator('[role="main"]')).toBeVisible();
    await expect(page.locator('[role="list"]')).toBeVisible();
    
    // Create a session with unique name
    const timestamp = Date.now();
    const sessionTitle = `Accessibility Test Session ${timestamp}`;
    
    await page.click('[aria-label="Add new training session"]');
    await page.getByLabel('Session Title *').fill(sessionTitle);
    await page.getByLabel('Description *').fill('Testing accessibility during CRUD');
    await page.getByLabel('Status *').selectOption('Completed');
    await page.getByRole('button', { name: 'Create training session' }).click();
    
    // Back on list - check accessibility maintained
    await expect(page).toHaveURL('/list');
    await expect(page.locator('[role="main"]')).toBeVisible();
    await expect(page.locator('[role="list"]')).toBeVisible();
    await expect(page.locator('[role="listitem"]').first()).toBeVisible();
    
    // Delete the session by finding its specific delete button
    const sessionItem = page.locator('.session-item').filter({ hasText: sessionTitle });
    const deleteButton = sessionItem.locator('.delete-button');
    await deleteButton.click();
    
    // Check modal accessibility
    await expect(page.locator('[role="dialog"]')).toBeVisible();
    await expect(page.locator('[aria-labelledby="delete-confirm-title"]')).toBeVisible();
    await expect(page.locator('[aria-describedby="delete-confirm-description"]')).toBeVisible();
    
    // Wait for modal to be fully interactive
    await page.waitForSelector('[role="dialog"]', { state: 'visible' });
    await page.waitForSelector('[role="dialog"] button', { state: 'visible' });
    
    // Click "Yes, Delete" to proceed to final confirmation
    await page.getByRole('button', { name: 'Yes, proceed to final confirmation' }).click();
    
    // Wait for final confirmation modal and click "Yes, Delete Permanently"
    await page.waitForSelector('[role="dialog"]', { state: 'visible' });
    await page.getByRole('button', { name: 'Yes, delete this training session permanently' }).click();
    
    // Check accessibility after deletion
    await expect(page.locator('[role="main"]')).toBeVisible();
    // Verify our specific session is gone (don't assume empty list)
    await expect(page.locator('.session-item').filter({ hasText: sessionTitle })).not.toBeVisible();
  });

  test('should hide edit and delete features when not logged in', async ({ page }) => {
    // Navigate to list page without logging in
    await page.goto('/list');
    
    // Wait for sessions to load
    await expect(page.getByRole('heading', { name: 'Training Sessions', level: 1 })).toBeVisible();
    const listNL = page.getByRole('list', { name: 'Training sessions' });
    await expect(listNL).toBeVisible();
    await expect(listNL.getByRole('listitem').first()).toBeVisible();
    
    // Get the first session item
    const firstSession = listNL.getByRole('listitem').first();
    await expect(firstSession).toBeVisible();
    
    // Session title should be a span, not a button (not clickable for editing)
    const sessionTitle = firstSession.getByRole('heading', { level: 3 });
    await expect(sessionTitle).toBeVisible();
    
    // Should not have edit button
    await expect(firstSession.getByRole('button', { name: /Edit training session/ })).not.toBeVisible();
    
    // Should not have delete button
    await expect(firstSession.getByRole('button', { name: /Delete training session/ })).not.toBeVisible();
    
    // Try to navigate directly to edit page - should redirect to login
    await page.goto('/edit/1');
    await expect(page).toHaveURL('/login');
  });

  test('should show edit and delete features when logged in', async ({ page }) => {
    // First login
    await page.goto('/login');
    await page.getByLabel('Username *').fill('joel');
    await page.getByLabel('Password *').fill('grimberg');
    await page.getByRole('button', { name: 'Sign in to your account' }).click();
    
    // Wait for successful login redirect to list page
    await expect(page).toHaveURL('/list');
    
    // Wait for sessions to load
    await expect(page.getByRole('heading', { name: 'Training Sessions', level: 1 })).toBeVisible();
    const listLI = page.getByRole('list', { name: 'Training sessions' });
    await expect(listLI).toBeVisible();
    await expect(listLI.getByRole('listitem').first()).toBeVisible();
    
    // Get the first session item
    const firstSession = listLI.getByRole('listitem').first();
    await expect(firstSession).toBeVisible();
    
    // Session title should be a button (clickable for editing)
    const editButton = firstSession.getByRole('button', { name: /Edit training session/ });
    await expect(editButton).toBeVisible();
    
    // Should have delete button
    const deleteButton = firstSession.getByRole('button', { name: /Delete training session/ });
    await expect(deleteButton).toBeVisible();
  });
});
