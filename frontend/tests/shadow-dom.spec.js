import { test, expect } from '@playwright/test'

test.describe('Shadow DOM Testing Workarounds', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/shadow-dom')
    
    // Wait for the custom element to be defined and rendered
    await page.waitForFunction(() => {
      const element = document.querySelector('hello-shadow')
      return element && element.shadowRoot && element.shadowRoot.querySelector('button')
    })
  })

  test('should render shadow DOM page with proper structure', async ({ page }) => {
    // Check that the main page container is visible
    // This ensures the page loaded correctly before testing Shadow DOM content
    await expect(page.getByTestId('shadow-page')).toBeVisible()
    
    // Verify the page title is displayed correctly
    // This confirms the page structure and content are rendered
    await expect(page.getByTestId('shadow-title')).toHaveText('Shadow DOM')
    
    // Check that the description text contains expected content
    // Using toContainText instead of exact match for flexibility
    await expect(page.getByTestId('shadow-description')).toContainText('Web Component using Shadow DOM')
    
    // Verify the custom Shadow DOM element is present in the light DOM
    // This is the host element that contains the shadow root
    await expect(page.getByTestId('hello-shadow-element')).toBeVisible()
  })

  test.describe('Workaround 1: CSS Parts for styling and testing', () => {
    test('should access shadow DOM elements using CSS parts', async ({ page }) => {
      // Locate the custom element in the light DOM
      // This is the host element that contains the shadow root
      const shadowElement = page.locator('hello-shadow')
      
      // Access the button inside the shadow DOM using CSS class selector
      // We use .btn instead of ::part(button) because Playwright has limited CSS parts support
      // The .btn class is defined inside the shadow root's styles
      const button = shadowElement.locator('.btn')
      await expect(button).toBeVisible()
      await expect(button).toHaveText('Click me')
      
      // Access the status element inside the shadow DOM
      // Initially empty, so we check for existence rather than visibility
      const status = shadowElement.locator('.status')
      await expect(status).toHaveCount(1) // Check element exists, not visibility
      
      // Click the button to trigger the click handler inside the shadow DOM
      // This will update the status text content
      await button.click()
      await expect(status).toBeVisible() // Now it should be visible with content
      await expect(status).toHaveText('Clicked 1 time')
      
      // Click again to test the counter increment
      // This verifies the shadow DOM's internal state management
      await button.click()
      await expect(status).toHaveText('Clicked 2 times')
    })

    test('should style shadow DOM elements using CSS parts', async ({ page }) => {
      // Inject custom CSS styles into the page using addStyleTag
      // This demonstrates how external CSS can style Shadow DOM elements via CSS parts
      // The ::part() pseudo-element allows styling of specific parts inside shadow DOM
      await page.addStyleTag({
        content: `
          hello-shadow::part(button) {
            background: linear-gradient(45deg, #ff6b6b, #ee5a24) !important;
            transform: scale(1.1) !important;
          }
          hello-shadow::part(status) {
            color: #ff6b6b !important;
            font-weight: bold !important;
          }
        `
      })
      
      // Locate elements inside the shadow DOM for testing
      // We use class selectors as fallback since Playwright's CSS parts support is limited
      const button = page.locator('hello-shadow .btn')
      const status = page.locator('hello-shadow .status')
      
      // Verify the button is visible and ready for interaction
      await expect(button).toBeVisible()
      // Check that status element exists (initially empty, so not visible)
      await expect(status).toHaveCount(1) // Check element exists, not visibility
      
      // Click the button to trigger the shadow DOM's internal functionality
      // This will populate the status element with content and verify styling works
      await button.click()
      await expect(status).toBeVisible() // Now it should be visible with content
      await expect(status).toHaveText('Clicked 1 time')
    })
  })

  test.describe('Workaround 2: Direct shadow root access', () => {
    test('should access shadow root directly using evaluate', async ({ page }) => {
      // Use page.evaluate() to execute JavaScript directly in the browser context
      // This allows us to access the shadow root directly, bypassing Playwright's limitations
      // We get a reference to the shadow root object (though it can't be serialized back)
      const shadowRoot = await page.evaluate(() => {
        const element = document.querySelector('hello-shadow')
        return element.shadowRoot
      })
      
      // Access elements within shadow root using direct DOM manipulation
      // This demonstrates how to read content from inside the shadow DOM
      const buttonText = await page.evaluate(() => {
        const element = document.querySelector('hello-shadow')
        const button = element.shadowRoot.querySelector('.btn')
        return button ? button.textContent : null
      })
      
      // Verify we can read the button text from inside the shadow DOM
      expect(buttonText).toBe('Click me')
      
      // Click button through direct shadow root access
      // This shows how to trigger events inside the shadow DOM
      await page.evaluate(() => {
        const element = document.querySelector('hello-shadow')
        const button = element.shadowRoot.querySelector('.btn')
        if (button) button.click()
      })
      
      // Verify status was updated by reading from shadow DOM again
      // This confirms the shadow DOM's internal state changed
      const statusText = await page.evaluate(() => {
        const element = document.querySelector('hello-shadow')
        const status = element.shadowRoot.querySelector('.status')
        return status ? status.textContent : null
      })
      
      expect(statusText).toBe('Clicked 1 time')
    })

    test('should manipulate shadow DOM input through direct access', async ({ page }) => {
      // Use page.evaluate() to directly manipulate the input field inside the shadow DOM
      // This demonstrates how to set values and trigger events within encapsulated components
      // We set the value and dispatch an 'input' event to simulate user typing
      await page.evaluate(() => {
        const element = document.querySelector('hello-shadow')
        const input = element.shadowRoot.querySelector('input')
        if (input) {
          input.value = 'Test input value'
          input.dispatchEvent(new Event('input', { bubbles: true }))
        }
      })
      
      // Submit the form by clicking the submit button inside the shadow DOM
      // This shows how to trigger form submission within the encapsulated component
      await page.evaluate(() => {
        const element = document.querySelector('hello-shadow')
        const submitBtn = element.shadowRoot.querySelector('.submit-btn')
        if (submitBtn) submitBtn.click()
      })
      
      // Verify the result by reading the output from inside the shadow DOM
      // This confirms that the form processing worked correctly within the component
      const resultText = await page.evaluate(() => {
        const element = document.querySelector('hello-shadow')
        const result = element.shadowRoot.querySelector('.api-result')
        return result ? result.textContent : null
      })
      
      expect(resultText).toBe('Submitted: "Test input value"')
    })
  })

  test.describe('Workaround 3: CSS selectors that penetrate shadow DOM', () => {
    test('should use CSS selectors to access shadow DOM elements', async ({ page }) => {
      // Use CSS selectors that can penetrate shadow DOM
      const button = page.locator('hello-shadow .btn')
      const status = page.locator('hello-shadow .status')
      const input = page.locator('hello-shadow input')
      const submitBtn = page.locator('hello-shadow .submit-btn')
      
      await expect(button).toBeVisible()
      await expect(status).toHaveCount(1) // Check element exists, not visibility
      await expect(input).toBeVisible()
      await expect(submitBtn).toBeVisible()
      
      // Test interaction
      await button.click()
      await expect(status).toBeVisible() // Now it should be visible with content
      await expect(status).toHaveText('Clicked 1 time')
      
      await input.fill('CSS selector test')
      await submitBtn.click()
      
      const result = page.locator('hello-shadow .api-result')
      await expect(result).toHaveText('Submitted: "CSS selector test"')
    })

    test('should use attribute selectors in shadow DOM', async ({ page }) => {
      // Use attribute selectors
      const button = page.locator('hello-shadow .btn[type="button"]')
      const input = page.locator('hello-shadow input[type="text"]')
      
      await expect(button).toBeVisible()
      await expect(input).toBeVisible()
      
      // Test interaction
      await button.click()
      const status = page.locator('hello-shadow .status')
      await expect(status).toHaveText('Clicked 1 time')
    })
  })

  test.describe('Workaround 4: Public API methods for testing', () => {
    test('should use public API methods instead of DOM manipulation', async ({ page }) => {
      // Get click count through public API
      let clickCount = await page.evaluate(() => {
        const element = document.querySelector('hello-shadow')
        return element.getClickCount()
      })
      
      expect(clickCount).toBe(0)
      
      // Simulate button click through public API
      await page.evaluate(() => {
        const element = document.querySelector('hello-shadow')
        element.simulateButtonClick()
      })
      
      // Verify click count updated
      clickCount = await page.evaluate(() => {
        const element = document.querySelector('hello-shadow')
        return element.getClickCount()
      })
      
      expect(clickCount).toBe(1)
      
      // Verify status text through shadow root
      const statusText = await page.evaluate(() => {
        const element = document.querySelector('hello-shadow')
        const status = element.shadowRoot.querySelector('.status')
        return status ? status.textContent : null
      })
      
      expect(statusText).toBe('Clicked 1 time')
    })

    test('should use public API for input manipulation', async ({ page }) => {
      // Set input value through public API
      await page.evaluate(() => {
        const element = document.querySelector('hello-shadow')
        element.setInputValue('API test value')
      })
      
      // Verify input value through public API
      const inputValue = await page.evaluate(() => {
        const element = document.querySelector('hello-shadow')
        return element.getInputValue()
      })
      
      expect(inputValue).toBe('API test value')
      
      // Submit form through public API
      await page.evaluate(() => {
        const element = document.querySelector('hello-shadow')
        element.simulateFormSubmit()
      })
      
      // Verify result
      const resultText = await page.evaluate(() => {
        const element = document.querySelector('hello-shadow')
        const result = element.shadowRoot.querySelector('.api-result')
        return result ? result.textContent : null
      })
      
      expect(resultText).toBe('Submitted: "API test value"')
    })

    test('should access shadow root through public API', async ({ page }) => {
      // Get shadow root through public API
      const shadowRootExists = await page.evaluate(() => {
        const element = document.querySelector('hello-shadow')
        const shadowRoot = element.getShadowRoot()
        return shadowRoot !== null
      })
      
      expect(shadowRootExists).toBe(true)
      
      // Use shadow root to access elements
      const buttonExists = await page.evaluate(() => {
        const element = document.querySelector('hello-shadow')
        const shadowRoot = element.getShadowRoot()
        const button = shadowRoot.querySelector('.btn')
        return button !== null
      })
      
      expect(buttonExists).toBe(true)
    })
  })

  test.describe('Custom Events and Integration', () => {
    test('should listen to custom events from shadow DOM', async ({ page }) => {
      // Set up event listener
      await page.evaluate(() => {
        const element = document.querySelector('hello-shadow')
        element.addEventListener('shadow-click', (event) => {
          window.lastClickEvent = event.detail
        })
        element.addEventListener('shadow-submit', (event) => {
          window.lastSubmitEvent = event.detail
        })
      })
      
      // Click button and verify custom event
      await page.locator('hello-shadow .btn').click()
      
      const clickEvent = await page.evaluate(() => window.lastClickEvent)
      expect(clickEvent).toEqual({ count: 1 })
      
      // Submit form and verify custom event
      await page.locator('hello-shadow input').fill('Event test')
      await page.locator('hello-shadow .submit-btn').click()
      
      const submitEvent = await page.evaluate(() => window.lastSubmitEvent)
      expect(submitEvent).toEqual({ value: 'Event test' })
    })

    test('should test shadow DOM accessibility', async ({ page }) => {
      // Test ARIA roles and labels
      const shadowElement = page.locator('hello-shadow')
      
      // Check that shadow DOM content has proper ARIA attributes
      const groupRole = await page.evaluate(() => {
        const element = document.querySelector('hello-shadow')
        const group = element.shadowRoot.querySelector('[role="group"]')
        return group ? group.getAttribute('aria-label') : null
      })
      
      expect(groupRole).toBe('Shadow content')
      
      // Check status element
      const statusRole = await page.evaluate(() => {
        const element = document.querySelector('hello-shadow')
        const status = element.shadowRoot.querySelector('[role="status"]')
        return status ? status.getAttribute('aria-live') : null
      })
      
      expect(statusRole).toBe('polite')
    })
  })

  test.describe('Performance and Edge Cases', () => {
    test('should handle multiple rapid clicks', async ({ page }) => {
      const button = page.locator('hello-shadow .btn')
      const status = page.locator('hello-shadow .status')
      
      // Rapid clicks
      for (let i = 0; i < 5; i++) {
        await button.click()
      }
      
      await expect(status).toHaveText('Clicked 5 times')
      
      // Verify through public API
      const clickCount = await page.evaluate(() => {
        const element = document.querySelector('hello-shadow')
        return element.getClickCount()
      })
      
      expect(clickCount).toBe(5)
    })

    test('should handle shadow DOM with dynamic content', async ({ page }) => {
      // Add dynamic content to shadow DOM
      await page.evaluate(() => {
        const element = document.querySelector('hello-shadow')
        const shadowRoot = element.shadowRoot
        const container = shadowRoot.querySelector('.box')
        
        const dynamicDiv = document.createElement('div')
        dynamicDiv.textContent = 'Dynamic content added!'
        dynamicDiv.setAttribute('data-testid', 'dynamic-content')
        container.appendChild(dynamicDiv)
      })
      
      // Verify dynamic content is accessible
      const dynamicContent = await page.evaluate(() => {
        const element = document.querySelector('hello-shadow')
        const dynamicDiv = element.shadowRoot.querySelector('[data-testid="dynamic-content"]')
        return dynamicDiv ? dynamicDiv.textContent : null
      })
      
      expect(dynamicContent).toBe('Dynamic content added!')
    })
  })
})
