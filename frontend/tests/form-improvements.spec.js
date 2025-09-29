import { test, expect } from '@playwright/test'

test.describe('Form Improvements Tests', () => {
  test.beforeEach(async ({ page }) => {
    // Ensure logged-in state for add/edit flows
    await page.goto('/login')
    await page.getByLabel('Username *').fill('joel')
    await page.getByLabel('Password *').fill('grimberg')
    await page.getByRole('button', { name: 'Sign in to your account' }).click()
    await expect(page.getByRole('banner').getByRole('link', { name: 'You are logged in - click to logout' })).toBeVisible()

    // Navigate to the add session page
    await page.goto('/add')
    await expect(page.getByRole('heading', { name: 'Add New Training Session' })).toBeVisible()
  })

  test('should have correct placeholders in add session form', async ({ page }) => {
    // Check title placeholder
    const titleInput = page.getByLabel('Session Title *')
    await expect(titleInput).toHaveAttribute('placeholder', 'Enter session title')

    // Check description placeholder  
    const descriptionInput = page.getByLabel('Description *')
    await expect(descriptionInput).toHaveAttribute('placeholder', 'Enter session description')

    // Check duration placeholder and step attribute
    const durationInput = page.getByLabel('Duration (hours)')
    await expect(durationInput).toHaveAttribute('placeholder', '2.5')
    await expect(durationInput).toHaveAttribute('step', '0.5')
    await expect(durationInput).toHaveAttribute('min', '0.5')
  })

  test('should have left-aligned labels in add session form', async ({ page }) => {
    // Check that all labels are left-aligned using ARIA
    const labels = page.getByLabel('Session Title *', 'Description *', 'Status *', 'Duration (hours)')
    const labelCount = await labels.count()
    
    for (let i = 0; i < labelCount; i++) {
      const label = labels.nth(i)
      // Get the associated label element using aria-label
      const labelElement = page.locator(`label[for="${await label.getAttribute('id')}"]`)
      await expect(labelElement).toHaveCSS('text-align', 'left')
    }
  })

  test('should support decimal input with dot delimiter in duration field', async ({ page }) => {
    const durationInput = page.getByLabel('Duration (hours)')
    
    // Clear and enter a decimal value with dot
    await durationInput.fill('2.5')
    await expect(durationInput).toHaveValue('2.5')
    
    // Test arrow key behavior - should increment by 0.5
    await durationInput.focus()
    await page.keyboard.press('ArrowUp')
    await expect(durationInput).toHaveValue('3')
    
    await page.keyboard.press('ArrowDown')
    await expect(durationInput).toHaveValue('2.5')
  })

  test('should have consistent form styling across add and edit forms', async ({ page }) => {
    // Navigate to an edit form (create a session first)
    const timestamp = Date.now()
    const uniqueTitle = `Test Session for Styling ${timestamp}`
    
    await page.getByLabel('Session Title *').fill(uniqueTitle)
    await page.getByLabel('Description *').fill('Test description')
    await page.getByLabel('Status *').selectOption('Pending')
    await page.getByLabel('Duration (hours)').fill('2.5')
    
    // Submit the form
    await page.getByRole('button', { name: 'Create training session' }).click()
    await page.waitForURL('**/list')
    
    // Click on the session title to edit - target ARIA list then button
    const list = page.getByRole('list', { name: 'Training sessions' })
    await expect(list).toBeVisible()
    const item = list.getByRole('listitem').filter({ hasText: uniqueTitle }).first()
    await expect(item).toBeVisible()
    await item.getByRole('button', { name: new RegExp(`^Edit training session: ${uniqueTitle}$`) }).click()
    await page.waitForURL('**/edit/**')
    
    // Check edit form labels alignment using ARIA
    const editFormInputs = page.getByLabel('Session Title *', 'Description *', 'Status *', 'Duration (hours)')
    const editInputCount = await editFormInputs.count()
    
    for (let i = 0; i < editInputCount; i++) {
      const input = editFormInputs.nth(i)
      const labelElement = page.locator(`label[for="${await input.getAttribute('id')}"]`)
      await expect(labelElement).toHaveCSS('text-align', 'left')
    }
  })

  test('should have left-aligned help text in edit form', async ({ page }) => {
    // Create a session first to access edit form
    const timestamp = Date.now()
    const uniqueTitle = `Help Text Test ${timestamp}`
    
    await page.getByLabel('Session Title *').fill(uniqueTitle)
    await page.getByLabel('Description *').fill('Test description')
    await page.getByLabel('Status *').selectOption('Pending')
    await page.getByLabel('Duration (hours)').fill('2.5')
    
    // Submit the form
    await page.getByRole('button', { name: 'Create training session' }).click()
    await page.waitForURL('**/list')
    
    // Click on the session title to edit
    const list2 = page.getByRole('list', { name: 'Training sessions' })
    await expect(list2).toBeVisible()
    const item2 = list2.getByRole('listitem').filter({ hasText: uniqueTitle }).first()
    await expect(item2).toBeVisible()
    await item2.getByRole('button', { name: new RegExp(`^Edit training session: ${uniqueTitle}$`) }).click()
    await page.waitForURL('**/edit/**')
    
    // Check that all help text elements are left-aligned using ARIA-describedby
    const inputs = page.getByLabel('Session Title *', 'Description *', 'Status *', 'Duration (hours)')
    const inputCount = await inputs.count()
    
    for (let i = 0; i < inputCount; i++) {
      const input = inputs.nth(i)
      const helpId = await input.getAttribute('aria-describedby')
      if (helpId) {
        const helpText = page.locator(`#${helpId}`)
        await expect(helpText).toHaveCSS('text-align', 'left')
      }
    }
    
    // Verify specific help text content using ARIA describedby
    const titleInput = page.getByLabel('Session Title *')
    const titleHelpId = await titleInput.getAttribute('aria-describedby')
    const titleHelpText = page.locator(`#${titleHelpId}`)
    await expect(titleHelpText).toHaveText('Enter a descriptive title for the training session')
    await expect(titleHelpText).toHaveCSS('text-align', 'left')
    
    const descriptionInput = page.getByLabel('Description *')
    const descriptionHelpId = await descriptionInput.getAttribute('aria-describedby')
    const descriptionHelpText = page.locator(`#${descriptionHelpId}`)
    await expect(descriptionHelpText).toHaveText('Provide a detailed description of what will be covered')
    await expect(descriptionHelpText).toHaveCSS('text-align', 'left')
    
    const durationInput = page.getByLabel('Duration (hours)')
    const durationHelpId = await durationInput.getAttribute('aria-describedby')
    const durationHelpText = page.locator(`#${durationHelpId}`)
    await expect(durationHelpText).toHaveText('Estimated duration in hours (optional)')
    await expect(durationHelpText).toHaveCSS('text-align', 'left')
  })
})

test.describe('Edit Form Placeholder Tests', () => {
  let sessionId
  let sessionTitle

  test.beforeEach(async ({ page }) => {
    // Ensure logged-in state for edit flows
    await page.goto('/login')
    await page.getByLabel('Username *').fill('joel')
    await page.getByLabel('Password *').fill('grimberg')
    await page.getByRole('button', { name: 'Sign in to your account' }).click()
    await expect(page.getByRole('banner').getByRole('link', { name: 'You are logged in - click to logout' })).toBeVisible()

    // Create a session first
    await page.goto('/add')
    
    const timestamp = Date.now()
    const randomId = Math.random().toString(36).substring(7)
    sessionTitle = `Edit Placeholder Test ${timestamp}-${randomId}`
    
    await page.getByLabel('Session Title *').fill(sessionTitle)
    await page.getByLabel('Description *').fill('Test description')
    await page.getByLabel('Status *').selectOption('Pending')
    await page.getByLabel('Duration (hours)').fill('3.5')
    
    await page.getByRole('button', { name: 'Create training session' }).click()
    await page.waitForURL('**/list')
    
    // Navigate to edit page - use first() to avoid strict mode
    await page.getByRole('button', { name: new RegExp(`Edit training session: ${sessionTitle}`) }).first().click()
    await page.waitForURL('**/edit/**')
  })

  test('should show placeholders when edit form fields are cleared', async ({ page }) => {
    // Clear title field and check placeholder appears
    const titleInput = page.getByLabel('Session Title *')
    await titleInput.clear()
    await expect(titleInput).toHaveAttribute('placeholder', 'Enter session title')
    
    // Clear description field and check placeholder appears
    const descriptionInput = page.getByLabel('Description *')
    await descriptionInput.clear()
    await expect(descriptionInput).toHaveAttribute('placeholder', 'Enter session description')
    
    // Clear duration field and check placeholder appears
    const durationInput = page.getByLabel('Duration (hours)')
    await durationInput.clear()
    await expect(durationInput).toHaveAttribute('placeholder', '2.5')
    await expect(durationInput).toHaveAttribute('step', '0.5')
  })

  test('should maintain correct step and min attributes in edit form duration field', async ({ page }) => {
    const durationInput = page.getByLabel('Duration (hours)')
    
    // Check attributes are present
    await expect(durationInput).toHaveAttribute('step', '0.5')
    await expect(durationInput).toHaveAttribute('min', '0.5')
    
    // Test decimal input with dot delimiter
    await durationInput.clear()
    await durationInput.fill('4.5')
    await expect(durationInput).toHaveValue('4.5')
    
    // Test arrow key behavior
    await durationInput.focus()
    await page.keyboard.press('ArrowUp')
    await expect(durationInput).toHaveValue('5')
  })

  test('should have select status placeholder option in edit form', async ({ page }) => {
    const statusSelect = page.getByLabel('Status *')
    
    // Check that the first option is the placeholder
    const firstOption = statusSelect.locator('option').first()
    await expect(firstOption).toHaveText('Select a status')
    await expect(firstOption).toHaveAttribute('value', '')
  })
})
