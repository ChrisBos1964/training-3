#!/bin/bash

echo "🚀 Starting Champions Training App..."
echo "================================================"

# Function to cleanup background processes on exit
cleanup() {
    echo ""
    echo "🛑 Shutting down services..."
    if [ ! -z "$BACKEND_PID" ]; then
        kill $BACKEND_PID 2>/dev/null
        echo "✅ Backend stopped"
    fi
    if [ ! -z "$FRONTEND_PID" ]; then
        kill $FRONTEND_PID 2>/dev/null
        echo "✅ Frontend stopped"
    fi
    echo "👋 All services stopped. Goodbye!"
    exit 0
}

# Set up signal handlers
trap cleanup SIGINT SIGTERM

# Check if backend dependencies are installed
if [ ! -d "backend/node_modules" ]; then
    echo "📦 Backend dependencies not found. Installing..."
    cd backend
    npm install
    if [ $? -ne 0 ]; then
        echo "❌ Failed to install backend dependencies"
        exit 1
    fi
    cd ..
    echo "✅ Backend dependencies installed"
fi

# Check if frontend dependencies are installed
if [ ! -d "frontend/node_modules" ]; then
    echo "📦 Frontend dependencies not found. Installing..."
    cd frontend
    npm install
    if [ $? -ne 0 ]; then
        echo "❌ Failed to install frontend dependencies"
        exit 1
    fi
    cd ..
    echo "✅ Frontend dependencies installed"
fi

# Check if database exists, if not initialize it
if [ ! -f "backend/training.db" ]; then
    echo "🗄️ Database not found. Initializing..."
    cd backend
    npm run init-db
    if [ $? -ne 0 ]; then
        echo "❌ Failed to initialize database"
        exit 1
    fi
    cd ..
    echo "✅ Database initialized"
fi

echo ""
echo "🔧 Starting Backend Server..."
cd backend
npm run dev &
BACKEND_PID=$!
cd ..

# Wait a moment for backend to start
sleep 3

# Check if backend is running
if ! curl -s http://localhost:3001/health > /dev/null; then
    echo "❌ Backend failed to start"
    cleanup
fi

echo "✅ Backend running on http://localhost:3001"

echo ""
echo "🎨 Starting Frontend..."
cd frontend
npm run dev &
FRONTEND_PID=$!
cd ..

# Wait a moment for frontend to start
sleep 5

echo "✅ Frontend starting on http://localhost:5173"
echo ""
echo "🎉 Both services are starting up!"
echo ""
echo "📱 Access your application:"
echo "   Frontend: http://localhost:5173"
echo "   Backend API: http://localhost:3001"
echo "   Health Check: http://localhost:3001/health"
echo ""
echo "🛑 Press Ctrl+C to stop all services"
echo ""

# Wait for user to stop
wait
