import { test, expect } from '@playwright/test';

// Always record a trace for this file when it runs locally
test.use({ trace: 'on' });

test.describe('Local debug tracer (intentional failure)', () => {
  // Mark this test as expected-to-fail so it won't fail the suite
  test.fail();

  test('should intentionally fail to inspect Playwright trace', async ({ page }) => {
    await page.goto('/');
    // Intentional failure: look for a non-existent element/text
    await expect(page.getByText('This text does not exist')).toBeVisible();
  });
});


