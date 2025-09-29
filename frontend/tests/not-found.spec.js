import { test, expect } from '@playwright/test'

test.describe('Not Found Page', () => {
  test('should render funny not-found text without header for unknown routes (ARIA)', async ({ page }) => {
    await page.goto('/some-unknown-route')

    // Header should be hidden on unknown routes
    await expect(page.getByRole('banner')).not.toBeVisible()

    // Main should be the not found page with correct aria-label
    const main = page.getByRole('main', { name: 'Page not found' })
    await expect(main).toBeVisible()

    // Title and description via semantics
    await expect(page.getByRole('heading', { name: 'Oops… Wrong Turn!' })).toBeVisible()
    await expect(page.getByTestId('not-found-text')).toBeVisible()
  })

  test('should render not-found page elements using testids and navigate home', async ({ page }) => {
    await page.goto('/another-unknown')

    // Assert via testids
    await expect(page.getByTestId('not-found-page')).toBeVisible()
    await expect(page.getByTestId('not-found-main')).toBeVisible()
    await expect(page.getByTestId('not-found-title')).toHaveText('Oops… Wrong Turn!')
    await expect(page.getByTestId('not-found-text')).toBeVisible()

    // Click the back home button
    await page.getByTestId('not-found-home').click()
    // Land on home; header should not be visible on home either
    await expect(page.getByRole('banner')).not.toBeVisible()
    await expect(page.getByRole('heading', { name: 'Hello Champions!' })).toBeVisible()
  })
})


