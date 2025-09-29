import { test, expect } from '@playwright/test'

test.describe('Training Sessions Filter Tests', () => {
  test.beforeEach(async ({ page }) => {
    // Navigate to the list page
    await page.goto('/list')
    
    // Wait for the page to load - use the main h1 heading
    await expect(page.locator('h1.page-title')).toBeVisible()
  })

  test('should display filter controls with proper ARIA roles', async ({ page }) => {
    // Check that filter section exists with proper role
    const filterSection = page.getByRole('search')
    await expect(filterSection).toBeVisible()

    // Check filter heading (visually hidden but accessible)
    await expect(page.getByRole('heading', { name: 'Filter Training Sessions' })).toBeVisible()

    // Check filter controls group
    const filterControls = page.getByRole('group', { name: 'Filter Training Sessions' })
    await expect(filterControls).toBeVisible()

    // Check title filter
    const titleFilter = page.getByLabel('Filter by Title')
    await expect(titleFilter).toBeVisible()
    await expect(titleFilter).toHaveAttribute('type', 'text')
    await expect(titleFilter).toHaveAttribute('placeholder', 'Enter title to filter...')

    // Check duration filter
    const durationFilter = page.getByLabel('Filter by Duration')
    await expect(durationFilter).toBeVisible()
    await expect(durationFilter).toHaveAttribute('type', 'text')
    await expect(durationFilter).toHaveAttribute('placeholder', 'Enter duration to filter...')

    // Check status filter
    const statusFilter = page.getByLabel('Filter by Status')
    await expect(statusFilter).toBeVisible()
    // Select elements don't have a role attribute by default, they're implicitly combobox

    // Check clear filters button
    const clearButton = page.getByRole('button', { name: 'Clear all filters' })
    await expect(clearButton).toBeVisible()
  })

  test('should filter sessions by title', async ({ page }) => {
    // Type in title filter
    const titleFilter = page.getByLabel('Filter by Title')
    await titleFilter.fill('Test')

    // Check that filter summary appears
    await expect(page.getByText(/Showing \d+ of \d+ sessions matching title "Test"/)).toBeVisible()

    // Verify only sessions with "Test" in title are shown
    const visibleSessions = page.locator('.session-item')
    const count = await visibleSessions.count()
    
    for (let i = 0; i < count; i++) {
      const sessionTitle = await visibleSessions.nth(i).locator('.session-title').textContent()
      expect(sessionTitle.toLowerCase()).toContain('test')
    }
  })

  test('should filter sessions by duration', async ({ page }) => {
    // Type in duration filter
    const durationFilter = page.getByLabel('Filter by Duration')
    await durationFilter.fill('2')

    // Check that filter summary appears
    await expect(page.getByText(/Showing \d+ of \d+ sessions matching duration "2"/)).toBeVisible()

    // Verify only sessions with duration containing "2" are shown
    const visibleSessions = page.locator('.session-item')
    const count = await visibleSessions.count()
    
    for (let i = 0; i < count; i++) {
      const sessionDuration = await visibleSessions.nth(i).locator('.session-duration').textContent()
      expect(sessionDuration).toContain('2')
    }
  })

  test('should filter sessions by status', async ({ page }) => {
    // Select status filter
    const statusFilter = page.getByLabel('Filter by Status')
    await statusFilter.selectOption('Pending')

    // Check that filter summary appears
    await expect(page.getByText(/Showing \d+ of \d+ sessions matching status "Pending"/)).toBeVisible()

    // Verify only sessions with "Pending" status are shown
    const visibleSessions = page.locator('.session-item')
    const count = await visibleSessions.count()
    
    for (let i = 0; i < count; i++) {
      const sessionStatus = await visibleSessions.nth(i).locator('.status-badge').textContent()
      expect(sessionStatus).toBe('Pending')
    }
  })

  test('should combine multiple filters', async ({ page }) => {
    // Apply title filter
    const titleFilter = page.getByLabel('Filter by Title')
    await titleFilter.fill('Test')

    // Apply status filter
    const statusFilter = page.getByLabel('Filter by Status')
    await statusFilter.selectOption('Pending')

    // Check that combined filter summary appears
    await expect(page.getByText(/Showing \d+ of \d+ sessions matching title "Test" matching status "Pending"/)).toBeVisible()

    // Verify sessions match both criteria
    const visibleSessions = page.locator('.session-item')
    const count = await visibleSessions.count()
    
    for (let i = 0; i < count; i++) {
      const sessionTitle = await visibleSessions.nth(i).locator('.session-title').textContent()
      const sessionStatus = await visibleSessions.nth(i).locator('.status-badge').textContent()
      expect(sessionTitle.toLowerCase()).toContain('test')
      expect(sessionStatus).toBe('Pending')
    }
  })

  test('should clear all filters when clear button is clicked', async ({ page }) => {
    // Apply multiple filters
    const titleFilter = page.getByLabel('Filter by Title')
    await titleFilter.fill('Test')

    const statusFilter = page.getByLabel('Filter by Status')
    await statusFilter.selectOption('Pending')

    // Verify filters are applied
    await expect(page.getByText(/Showing \d+ of \d+ sessions/)).toBeVisible()

    // Click clear filters button
    const clearButton = page.getByRole('button', { name: 'Clear all filters' })
    await clearButton.click()

    // Verify all filters are cleared
    await expect(titleFilter).toHaveValue('')
    await expect(statusFilter).toHaveValue('')
    
    // Verify filter summary is hidden
    await expect(page.getByText(/Showing \d+ of \d+ sessions/)).not.toBeVisible()

    // Verify all sessions are shown
    await expect(page.locator('.session-item')).toHaveCount(await page.locator('.session-item').count())
  })

  test('should show appropriate message when no sessions match filters', async ({ page }) => {
    // Apply a filter that won't match any sessions
    const titleFilter = page.getByLabel('Filter by Title')
    await titleFilter.fill('NonExistentSession')

    // Check that appropriate message is shown
    await expect(page.getByText('No sessions match the current filters. Try adjusting your search criteria.')).toBeVisible()
  })

  test('should maintain accessibility during filtering', async ({ page }) => {
    // Check that filter inputs have proper labels and descriptions
    const titleFilter = page.getByLabel('Filter by Title')
    await expect(titleFilter).toHaveAttribute('aria-describedby', 'title-filter-help')

    const durationFilter = page.getByLabel('Filter by Duration')
    await expect(durationFilter).toHaveAttribute('aria-describedby', 'duration-filter-help')

    const statusFilter = page.getByLabel('Filter by Status')
    await expect(statusFilter).toHaveAttribute('aria-describedby', 'status-filter-help')

    // Check that help text is accessible
    await expect(page.getByText('Type to filter sessions by title')).toBeVisible()
    await expect(page.getByText('Type to filter sessions by duration in hours')).toBeVisible()
    await expect(page.getByText('Select a status to filter sessions')).toBeVisible()

    // Check that filter summary has proper ARIA live region
    const titleFilter2 = page.getByLabel('Filter by Title')
    await titleFilter2.fill('Test')
    
    // Find the specific filter summary element
    const filterSummary = page.locator('.filter-summary')
    await expect(filterSummary).toBeVisible()
    await expect(filterSummary).toHaveAttribute('aria-live', 'polite')
  })

  test('should handle empty filter values correctly', async ({ page }) => {
    // Test that filter inputs can be filled and cleared
    const titleFilter = page.getByLabel('Filter by Title')
    const durationFilter = page.getByLabel('Filter by Duration')
    const statusFilter = page.getByLabel('Filter by Status')

    // Fill filters
    await titleFilter.fill('Test')
    await durationFilter.fill('2')
    await statusFilter.selectOption('Pending')

    // Verify filter summary appears
    await expect(page.getByText(/Showing \d+ of \d+ sessions/)).toBeVisible()

    // Clear filters using clear button
    const clearButton = page.getByRole('button', { name: 'Clear all filters' })
    await clearButton.click()

    // Verify filters are cleared
    await expect(titleFilter).toHaveValue('')
    await expect(durationFilter).toHaveValue('')
    await expect(statusFilter).toHaveValue('')

    // Verify filter summary disappears
    await expect(page.getByText(/Showing \d+ of \d+ sessions/)).not.toBeVisible()
  })
})
