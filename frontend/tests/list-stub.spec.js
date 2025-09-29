import { test, expect } from './my-test.js'

// This test uses the simple custom fixture `sessionsData`
// to stub the /api/sessions endpoint so the list shows exactly 1 item.

test('shows one item from custom fixture', async ({ page, sessionsData }) => {
  await page.route('**/api/sessions', (route) => {
    route.fulfill({
      status: 200,
      contentType: 'application/json',
      body: JSON.stringify(sessionsData),
    })
  })

  await page.goto('/list')

  const list = page.getByRole('list', { name: 'Training sessions' })
  await expect(list.getByRole('listitem')).toHaveCount(1)
  await expect(list.getByRole('listitem').first()).toContainText('My Single Session')
})
