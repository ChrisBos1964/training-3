import base from '@playwright/test'

export const test = base.extend({
  // Minimal custom option that just provides static data
  sessionsData: [
    [
      {
        id: 1,
        title: 'My Single Session',
        description: 'Stubbed via custom test data',
        status: 'Pending',
        duration: 1.5,
      },
    ],
    { option: true },
  ],
})

export const expect = base.expect
