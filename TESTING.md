# 🧪 Testing Guide

## 🚀 Unified Test Runner

The Champions Training App now includes a comprehensive test runner that allows you to run all tests from the repository root with a single command.

## 📋 Available Test Commands

### **Run All Tests**
```bash
# From repo root
npm run test:all

# Or use the test runner directly
./test-runner.sh all
```

### **Run Specific Test Suites**
```bash
# Backend tests only
npm run test:backend
./test-runner.sh backend

# Frontend tests only
npm run test:frontend
./test-runner.sh frontend

# Unit tests (frontend)
npm run test:unit

# API tests (backend)
npm run test:api
```

### **Run Individual Test Files**
```bash
# Integration tests
npm run test:integration
./test-runner.sh integration

# Accessibility tests
npm run test:accessibility
./test-runner.sh accessibility

# Health page tests
npm run test:health
./test-runner.sh health

# Header tests
npm run test:header
./test-runner.sh header

# Hello world tests
npm run test:hello
./test-runner.sh hello

# Add session tests
npm run test:add-session
./test-runner.sh add-session
```

### **Watch Mode**
```bash
# Run tests continuously (watch mode)
npm run test:watch
./test-runner.sh watch
```

### **Get Help**
```bash
# Show all available options
./test-runner.sh help
./test-runner.sh --help
./test-runner.sh -h
```

## 🎯 Test Categories

### **Backend Tests**
- **Location**: `backend/tests/`
- **Type**: API endpoint testing
- **Framework**: Playwright
- **Coverage**: CRUD operations, validation, error handling

### **Frontend Tests**
- **Location**: `frontend/tests/`
- **Type**: UI component testing
- **Framework**: Playwright
- **Coverage**: Accessibility, navigation, user interactions

### **Integration Tests**
- **Location**: `frontend/tests/integration.spec.js`
- **Type**: End-to-end testing
- **Coverage**: Frontend-backend communication

## 🏃‍♂️ Running Tests

### **Prerequisites**
1. **Backend running** on port 3001
2. **Frontend running** on port 5173
3. **Dependencies installed** in both directories

### **Quick Start**
```bash
# Terminal 1: Start backend
cd backend && npm run dev

# Terminal 2: Start frontend
cd frontend && npm run dev

# Terminal 3: Run all tests
npm run test:all
```

### **Individual Test Execution**
```bash
# Run just the hello world tests
npm run test:hello

# Run just the backend API tests
npm run test:api

# Run accessibility tests
npm run test:accessibility
```

## 🔧 Test Runner Features

### **Automatic Dependency Installation**
- Checks if `node_modules` exists
- Automatically runs `npm install` if needed
- Provides clear warnings and error messages

### **Error Handling**
- Stops on first test failure
- Clear error reporting with colors
- Proper exit codes for CI/CD integration

### **Directory Management**
- Automatically changes to correct directories
- Returns to original directory after completion
- Validates directory structure before running

### **Colored Output**
- **Blue**: Information messages
- **Green**: Success messages
- **Yellow**: Warning messages
- **Red**: Error messages

## 📊 Test Results

### **Success Output**
```
[INFO] Running ALL tests...
[INFO] Running Backend Tests...
[INFO] Starting backend tests...
[SUCCESS] Backend tests completed successfully!
[INFO] Running Frontend Tests...
[INFO] Starting frontend tests...
[SUCCESS] Frontend tests completed successfully!
[SUCCESS] All tests completed successfully! 🎉
```

### **Error Output**
```
[ERROR] Backend tests failed!
```

## 🚨 Troubleshooting

### **Common Issues**

1. **Tests fail with "Cannot connect to backend"**
   - Ensure backend is running on port 3001
   - Check `http://localhost:3001/health`

2. **Tests fail with "Cannot connect to frontend"**
   - Ensure frontend is running on port 5173
   - Check `http://localhost:5173`

3. **Permission denied on test-runner.sh**
   - Run: `chmod +x test-runner.sh`

4. **Dependencies not found**
   - Run: `npm run install:all`

### **Manual Test Execution**
If the test runner fails, you can still run tests manually:
```bash
# Backend tests
cd backend && npm test

# Frontend tests
cd frontend && npm test
```

## 🎉 Benefits

- **Single command** to run all tests
- **Consistent execution** across environments
- **Clear error reporting** with helpful messages
- **Automatic dependency management**
- **Flexible test selection** (all, specific suites, individual files)
- **Watch mode** for development
- **CI/CD ready** with proper exit codes

## 📝 Notes

- The test runner automatically handles directory changes
- Tests run sequentially to avoid conflicts
- Each test suite runs in its own environment
- Clear success/failure reporting for each step
- Supports both npm scripts and direct script execution


