#!/bin/bash

# Champions Training App - Test Runner
# This script provides a unified way to run all tests from the repo root

set -e  # Exit on any error

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Function to print colored output
print_status() {
    echo -e "${BLUE}[INFO]${NC} $1"
}

print_success() {
    echo -e "${GREEN}[SUCCESS]${NC} $1"
}

print_warning() {
    echo -e "${YELLOW}[WARNING]${NC} $1"
}

print_error() {
    echo -e "${RED}[ERROR]${NC} $1"
}

# Function to check if a directory exists
check_directory() {
    if [ ! -d "$1" ]; then
        print_error "Directory $1 does not exist!"
        exit 1
    fi
}

# Function to check if npm is available
check_npm() {
    if ! command -v npm &> /dev/null; then
        print_error "npm is not installed or not in PATH"
        exit 1
    fi
}

# Function to run backend tests
run_backend_tests() {
    print_status "Running Backend Tests..."
    cd backend
    
    if [ ! -f "package.json" ]; then
        print_error "Backend package.json not found!"
        exit 1
    fi
    
    if [ ! -d "node_modules" ]; then
        print_warning "Backend dependencies not installed. Installing..."
        npm install
    fi
    
    print_status "Starting backend tests..."
    if npm test; then
        print_success "Backend tests completed successfully!"
    else
        print_error "Backend tests failed!"
        exit 1
    fi
    
    cd ..
}

# Function to run frontend tests
run_frontend_tests() {
    print_status "Running Frontend Tests..."
    cd frontend
    
    if [ ! -f "package.json" ]; then
        print_error "Frontend package.json not found!"
        exit 1
    fi
    
    if [ ! -d "node_modules" ]; then
        print_warning "Frontend dependencies not installed. Installing..."
        npm install
    fi
    
    print_status "Starting frontend tests..."
    if npm test; then
        print_success "Frontend tests completed successfully!"
    else
        print_error "Frontend tests failed!"
        exit 1
    fi
    
    cd ..
}

# Function to run specific test file
run_specific_test() {
    local test_file=$1
    print_status "Running specific test: $test_file"
    
    cd frontend
    
    if [ ! -f "tests/$test_file" ]; then
        print_error "Test file tests/$test_file not found!"
        exit 1
    fi
    
    if [ ! -d "node_modules" ]; then
        print_warning "Frontend dependencies not installed. Installing..."
        npm install
    fi
    
    print_status "Running $test_file..."
    if npx playwright test "tests/$test_file"; then
        print_success "Test $test_file completed successfully!"
    else
        print_error "Test $test_file failed!"
        exit 1
    fi
    
    cd ..
}

# Function to show help
show_help() {
    echo "Champions Training App - Test Runner"
    echo ""
    echo "Usage: $0 [OPTION]"
    echo ""
    echo "Options:"
    echo "  all                    Run all tests (backend + frontend)"
    echo "  backend                Run only backend tests"
    echo "  frontend               Run only frontend tests"
    echo "  unit                   Run only frontend tests (alias for frontend)"
    echo "  api                    Run only backend tests (alias for backend)"
    echo "  integration            Run integration tests only"
    echo "  accessibility          Run accessibility tests only"
    echo "  health                 Run health page tests only"
    echo "  header                 Run header tests only"
    echo "  hello                  Run hello world tests only"
    echo "  add-session            Run add session tests only"
    echo "  watch                  Run tests in watch mode"
    echo "  help                   Show this help message"
    echo ""
    echo "Examples:"
    echo "  $0 all                 # Run all tests"
    echo "  $0 backend             # Run only backend tests"
    echo "  $0 frontend            # Run only frontend tests"
    echo "  $0 integration         # Run only integration tests"
    echo "  $0 hello              # Run only hello world tests"
    echo ""
}

# Function to run tests in watch mode
run_watch_mode() {
    print_status "Starting tests in watch mode..."
    print_warning "This will run tests continuously. Press Ctrl+C to stop."
    
    # Start backend tests in background
    cd backend
    npm run test:watch &
    BACKEND_PID=$!
    cd ..
    
    # Start frontend tests in background
    cd frontend
    npm run test:watch &
    FRONTEND_PID=$!
    cd ..
    
    # Wait for both processes
    wait $BACKEND_PID $FRONTEND_PID
}

# Main execution
main() {
    # Check prerequisites
    check_npm
    check_directory "backend"
    check_directory "frontend"
    
    case "${1:-all}" in
        "all")
            print_status "Running ALL tests..."
            run_backend_tests
            run_frontend_tests
            print_success "All tests completed successfully! 🎉"
            ;;
        "backend"|"api")
            run_backend_tests
            ;;
        "frontend"|"unit")
            run_frontend_tests
            ;;
        "integration")
            run_specific_test "integration.spec.js"
            ;;
        "accessibility")
            run_specific_test "accessibility.spec.js"
            ;;
        "health")
            run_specific_test "health-page.spec.js"
            ;;
        "header")
            run_specific_test "header.spec.js"
            ;;
        "hello")
            run_specific_test "hello-world.spec.js"
            ;;
        "add-session")
            run_specific_test "add-session.spec.js"
            ;;
        "watch")
            run_watch_mode
            ;;
        "help"|"-h"|"--help")
            show_help
            ;;
        *)
            print_error "Unknown option: $1"
            show_help
            exit 1
            ;;
    esac
}

# Run main function with all arguments
main "$@"
