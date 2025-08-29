# AI Development Rules for Champions Training App

## Overview
This document outlines the mandatory rules that AI assistants must follow when working on this React application. These rules ensure code quality, accessibility compliance, and proper testing practices.

## Core Rules

### 1. Test Every Change
**MANDATORY**: Every code change must be accompanied by comprehensive Playwright tests.

**Requirements:**
- Create or update test files for any new functionality
- Ensure all tests pass before considering work complete
- Test accessibility features explicitly
- Test navigation and user interactions
- Test responsive behavior on different viewport sizes
- Use semantic test descriptions that clearly indicate what is being tested

**Test File Structure:**
- `tests/hello-world.spec.js` - Home page functionality
- `tests/accessibility.spec.js` - Accessibility and navigation testing
- `tests/add-session.spec.js` - Add session form functionality
- Create new test files for new features

### 2. Add Accessibility Roles in Frontend
**MANDATORY**: Every UI element must have proper accessibility attributes and roles.

**Required Accessibility Features:**
- `role` attributes for semantic elements (button, navigation, main, form, list, etc.)
- `aria-label` for descriptive labels
- `aria-labelledby` for associating elements with headings
- `aria-describedby` for help text associations
- `aria-required` for required form fields
- Proper form labels with `htmlFor` attributes
- Screen reader friendly text and descriptions
- Keyboard navigation support
- Focus management

**Accessibility Standards:**
- Follow WCAG 2.1 AA guidelines
- Use semantic HTML elements
- Ensure proper color contrast
- Provide alternative text for images
- Support screen readers and assistive technologies

## Code Quality Standards

### 3. Component Structure
- Use functional components with hooks
- Implement proper error handling
- Follow React best practices
- Use TypeScript-like prop validation
- Maintain consistent naming conventions

### 4. Styling and UI
- Maintain the existing design system
- Use CSS classes consistently
- Ensure responsive design
- Follow the established color scheme and gradients
- Maintain visual hierarchy and spacing

### 5. State Management
- Use React hooks for local state
- Implement proper form handling
- Manage navigation state correctly
- Handle loading and error states

## Testing Requirements

### 6. Test Coverage
- Test all user interactions
- Test accessibility roles and attributes
- Test navigation between pages
- Test form validation and submission
- Test responsive behavior
- Test error scenarios

### 7. Test Best Practices
- Use descriptive test names
- Group related tests in describe blocks
- Test both positive and negative scenarios
- Use proper assertions and expectations
- Ensure tests are independent and repeatable

## File Organization

### 8. Project Structure
```
src/
  ├── App.jsx          # Main app with routing
  ├── HomePage.jsx     # Home page component
  ├── ListPage.jsx     # Training sessions list
  ├── AddSessionPage.jsx # Add session form
  ├── App.css          # Global styles
  └── main.jsx         # App entry point

tests/
  ├── hello-world.spec.js      # Home page tests
  ├── accessibility.spec.js    # Accessibility tests
  └── add-session.spec.js     # Add session tests
```

## Validation Checklist

Before considering any change complete, verify:

- [ ] All new functionality has corresponding tests
- [ ] All tests pass successfully
- [ ] Accessibility roles and attributes are properly implemented
- [ ] Navigation works correctly between all pages
- [ ] Forms have proper labels and validation
- [ ] UI maintains consistent styling
- [ ] Code follows React best practices
- [ ] No console errors or warnings
- [ ] Responsive design works on different viewport sizes

## Examples of Good Practices

### Proper Button Implementation:
```jsx
<button 
  className="hello-button"
  onClick={handleClick}
  aria-label="Navigate to training sessions list"
  role="button"
>
  Click me!
</button>
```

### Proper Form Field Implementation:
```jsx
<div className="form-group">
  <label htmlFor="session-title" className="form-label">
    Session Title *
  </label>
  <input
    type="text"
    id="session-title"
    name="title"
    required
    aria-required="true"
    aria-describedby="title-help"
    className="form-input"
  />
  <div id="title-help" className="form-help">
    Enter a descriptive title for the training session
  </div>
</div>
```

### Proper Test Implementation:
```javascript
test('should have proper accessibility roles', async ({ page }) => {
  await page.goto('/');
  
  // Check main application role
  await expect(page.locator('[role="application"]')).toBeVisible();
  
  // Check button role and aria-label
  const button = page.locator('[role="button"]');
  await expect(button).toHaveAttribute('aria-label', 'Navigate to training sessions list');
});
```

## Consequences of Non-Compliance

- Tests will fail and reveal accessibility issues
- Code quality will be compromised
- Accessibility compliance will be violated
- User experience will be degraded
- Project standards will not be maintained

## Final Note

These rules are not optional. They are the foundation of building a high-quality, accessible, and well-tested application. Every AI assistant working on this project must adhere to these rules without exception.

Remember: **Test Every Change** and **Add Accessibility Roles** are the two pillars of this development process.
