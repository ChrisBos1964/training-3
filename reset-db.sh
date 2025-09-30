#!/bin/bash

# Champions Training App - Database Reset Script
# This script clears the database and restores it to its original state

set -e # Exit on any error

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
  if ! command -v npm &>/dev/null; then
    print_error "npm is not installed or not in PATH"
    exit 1
  fi
}

# Function to find and stop backend server
stop_backend_server() {
  print_status "Checking for running backend server..."
  
  # Find backend process
  local backend_pid=$(lsof -ti:3001 2>/dev/null || echo "")
  
  if [ -n "$backend_pid" ]; then
    print_warning "Backend server is running on port 3001 (PID: $backend_pid)"
    print_status "Stopping backend server..."
    
    # Try graceful shutdown first
    if kill -TERM "$backend_pid" 2>/dev/null; then
      print_status "Sent SIGTERM to backend server, waiting for graceful shutdown..."
      
      # Wait up to 10 seconds for graceful shutdown
      local count=0
      while [ $count -lt 10 ] && lsof -ti:3001 >/dev/null 2>&1; do
        sleep 1
        count=$((count + 1))
      done
      
      # If still running, force kill
      if lsof -ti:3001 >/dev/null 2>&1; then
        print_warning "Backend server did not shutdown gracefully, force killing..."
        kill -KILL "$backend_pid" 2>/dev/null || true
      fi
    fi
    
    # Wait a moment for port to be released
    sleep 2
    
    # Verify server is stopped
    if ! lsof -ti:3001 >/dev/null 2>&1; then
      print_success "Backend server stopped successfully"
    else
      print_error "Failed to stop backend server"
      exit 1
    fi
  else
    print_status "No backend server running on port 3001"
  fi
}

# Function to check if backend is running
check_backend_running() {
  if curl -s http://localhost:3001/health >/dev/null 2>&1; then
    print_warning "Backend is currently running on port 3001"
    print_warning "The script will automatically stop it before resetting the database"
    read -p "Continue? (y/N): " -n 1 -r
    echo
    if [[ ! $REPLY =~ ^[Yy]$ ]]; then
      print_status "Database reset cancelled"
      exit 0
    fi
  fi
}

# Function to backup existing database
backup_database() {
  local db_path="./backend/training.db"
  local backup_path="./backend/training.db.backup.$(date +%Y%m%d_%H%M%S)"

  if [ -f "$db_path" ]; then
    print_status "Creating backup of existing database..."
    cp "$db_path" "$backup_path"
    print_success "Database backed up to: $backup_path"
  else
    print_warning "No existing database found to backup"
  fi
}

# Function to clear database
clear_database() {
  local db_path="./backend/training.db"

  if [ -f "$db_path" ]; then
    print_status "Removing existing database..."
    
    # Ensure no processes are using the database
    local db_processes=$(lsof "$db_path" 2>/dev/null | grep -v PID || echo "")
    if [ -n "$db_processes" ]; then
      print_warning "Some processes are still using the database:"
      echo "$db_processes"
      print_error "Cannot safely remove database while it's in use"
      exit 1
    fi
    
    rm -f "$db_path"
    print_success "Existing database removed"
  else
    print_warning "No existing database found to remove"
  fi
}

# Function to initialize database
initialize_database() {
  print_status "Initializing fresh database..."

  cd ./backend

  if [ ! -f "package.json" ]; then
    print_error "Backend package.json not found!"
    exit 1
  fi

  if [ ! -d "node_modules" ]; then
    print_warning "Backend dependencies not installed. Installing..."
    npm install
  fi

  print_status "Running database initialization..."
  if npm run init-db; then
    print_success "Database initialized successfully!"
  else
    print_error "Database initialization failed!"
    exit 1
  fi

  cd ../frontend
}

# Function to verify database state
verify_database() {
  print_status "Verifying database state..."

  # Wait a moment for database to be ready
  sleep 2

  # Check if backend is accessible
  if curl -s http://localhost:3001/health >/dev/null 2>&1; then
    print_success "Backend health check passed"

    # Check if we can get sessions
    local response=$(curl -s http://localhost:3001/api/sessions)
    if [ $? -eq 0 ]; then
      local session_count=$(echo "$response" | grep -o '"id"' | wc -l)
      print_success "Database contains $session_count training sessions"
    else
      print_warning "Could not verify training sessions"
    fi
  else
    print_warning "Backend not accessible - database verification skipped"
  fi
}

# Function to show help
show_help() {
  echo "Champions Training App - Database Reset Script"
  echo ""
  echo "Usage: $0 [OPTION]"
  echo ""
  echo "Options:"
  echo "  reset                 Reset database to original state (default)"
  echo "  backup                Only create backup of existing database"
  echo "  clear                 Only clear existing database"
  echo "  init                  Only initialize fresh database"
  echo "  verify                Only verify current database state"
  echo "  help                  Show this help message"
  echo ""
  echo "Examples:"
  echo "  $0                    # Full reset (backup + clear + init)"
  echo "  $0 reset              # Full reset (backup + clear + init)"
  echo "  $0 backup             # Only backup existing database"
  echo "  $0 clear              # Only clear existing database"
  echo "  $0 init               # Only initialize fresh database"
  echo "  $0 verify             # Only verify database state"
  echo ""
  echo "Note: This script will automatically stop the backend server and create a backup before making any changes."
}

# Main execution
main() {
  # Check prerequisites
  check_npm
  check_directory ".."
  check_directory "./backend"

  case "${1:-reset}" in
  "reset")
    print_status "Starting full database reset..."
    check_backend_running
    stop_backend_server
    backup_database
    clear_database
    initialize_database
    verify_database
    print_success "Database reset completed successfully! 🎉"
    ;;
  "backup")
    print_status "Creating database backup..."
    backup_database
    print_success "Backup completed!"
    ;;
  "clear")
    print_status "Clearing database..."
    check_backend_running
    stop_backend_server
    backup_database
    clear_database
    print_success "Database cleared!"
    ;;
  "init")
    print_status "Initializing database..."
    initialize_database
    print_success "Database initialized!"
    ;;
  "verify")
    print_status "Verifying database..."
    verify_database
    print_success "Verification completed!"
    ;;
  "help" | "-h" | "--help")
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


