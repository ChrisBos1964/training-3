# React Hello Nationale Nederlanden with Playwright Testing

A simple React Hello Nationale Nederlanden application with Playwright end-to-end testing setup.

## 🚀 Quick Start

### 1. Clone this repository

```bash
git clone <your-repository-url>
cd training-3
```

### 2. Install the frontend dependencies

```bash
cd frontend
npm install
```

### 3. Run the frontend development server

```bash
npm run dev
```

The application will be available at `http://localhost:5173`

### 4. Run Playwright tests

First, make sure you have the Playwright browsers installed:

```bash
npx playwright install
```

Then run the tests:

```bash
# Run all tests
npx playwright test

# Run tests in headed mode (see the browser)
npx playwright test --headed

# Run tests in a specific browser
npx playwright test --project=chromium

# Run tests and open the HTML report
npx playwright test --reporter=html
npx playwright show-report
```

## 📁 Project Structure

```
training-3/
├── frontend/                 # React application
│   ├── src/
│   │   ├── App.jsx          # Main Hello World component
│   │   ├── App.css          # Component styles
│   │   └── index.css        # Global styles
│   ├── tests/               # Playwright test files
│   │   └── hello-world.spec.js
│   ├── playwright.config.js # Playwright configuration
│   └── package.json
└── README.md
```

## 🧪 Testing

The project includes Playwright tests that verify:

- The Hello Nationale Nederlanden page loads correctly
- The main heading is displayed
- The welcome message is present
- The button is clickable

### Continuous Integration

This project uses GitHub Actions for continuous integration. Every time you push changes to the `main` or `master` branch, the Playwright tests will automatically run in the cloud.

- **Workflow**: `.github/workflows/playwright.yml`
- **Triggers**: Push to main/master branch and pull requests
- **Runs on**: Ubuntu latest with Node.js 20
- **Artifacts**: Test reports are uploaded and available for 30 days

### Test Commands

```bash
# Run tests in watch mode (re-run on file changes)
npx playwright test --watch

# Run tests in debug mode
npx playwright test --debug

# Run a specific test file
npx playwright test hello-world.spec.js

# Generate test code from browser actions
npx playwright codegen http://localhost:5173

### Viewing Test Results

After running tests, you can view the HTML report:

```bash
# Open the HTML report locally
npx playwright show-report

# Or open the report file directly
open playwright-report/index.html
```

For GitHub Actions runs, test reports are available as artifacts in the Actions tab.

## 🛠️ Available Scripts

In the `frontend` directory:

- `npm run dev` - Start development server
- `npm run build` - Build for production
- `npm run preview` - Preview production build
- `npm run lint` - Run ESLint
- `npm test` - Run Playwright tests
- `npm run test:headed` - Run tests in headed mode (see browser)
- `npm run test:ui` - Run tests with Playwright UI mode
- `npm run test:debug` - Run tests in debug mode

## 🎯 What's Included

- **React 19** with Vite for fast development
- **Modern CSS** with gradients and animations
- **Playwright** for end-to-end testing
- **Responsive design** that works on all devices
- **Clean, maintainable code** structure

## 🔧 Development

The application is a simple Hello Nationale Nederlanden page with:
- A main heading "Hello Nationale Nederlanden!"
- A welcome message
- An interactive button with hover effects
- Beautiful gradient background

Perfect for learning React and Playwright testing! 