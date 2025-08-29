# Champions Training App

A comprehensive training session management application with a React frontend and Node.js backend, featuring full CRUD operations, accessibility compliance, and comprehensive testing.

## 🚀 Features

- **Frontend**: Modern React application with React Router
- **Backend**: Node.js/Express REST API with SQLite database
- **Full CRUD**: Create, Read, Update, and Delete training sessions
- **Accessibility**: WCAG 2.1 AA compliant with proper ARIA roles
- **Testing**: Comprehensive Playwright tests for both frontend and backend
- **Responsive Design**: Mobile-first design with beautiful UI

## 🏗️ Architecture

```
training-3/
├── frontend/          # React frontend application
│   ├── src/          # Source code
│   ├── tests/        # Frontend tests
│   └── package.json  # Frontend dependencies
├── backend/           # Node.js backend API
│   ├── src/          # Backend source code
│   ├── tests/        # Backend API tests
│   └── package.json  # Backend dependencies
└── README.md         # This file
```

## 🛠️ Technology Stack

### Frontend
- **React 19** - Modern React with hooks
- **React Router** - Client-side routing
- **CSS3** - Custom styling with gradients and animations
- **Playwright** - End-to-end testing

### Backend
- **Node.js** - JavaScript runtime
- **Express** - Web framework
- **SQLite** - Lightweight database
- **Playwright** - API testing

## 📋 Prerequisites

- Node.js (v18 or higher)
- npm or yarn
- Git

## 🚀 Quick Start

### 1. Clone and Setup
```bash
git clone <repository-url>
cd training-3
```

### 2. Backend Setup
```bash
cd backend
npm install
npm run init-db
npm run dev
```

The backend will start on `http://localhost:3001`

### 3. Frontend Setup
```bash
cd ../frontend
npm install
npm run dev
```

The frontend will start on `http://localhost:5173`

### 4. Access the Application
- Frontend: http://localhost:5173
- Backend API: http://localhost:3001
- Health Check: http://localhost:3001/health

## 🧪 Testing

### Frontend Tests
```bash
cd frontend
npm test
```

### Backend Tests
```bash
cd backend
npm test
```

### All Tests (from project root)
```bash
# Frontend tests
cd frontend && npm test

# Backend tests  
cd ../backend && npm test
```

## 📱 Application Features

### Home Page
- Welcome message
- Navigation to training sessions list

### Training Sessions List
- View all training sessions
- Add new sessions
- Delete existing sessions with confirmation
- Real-time data from backend API

### Add Session Form
- Create new training sessions
- Form validation
- Real-time feedback
- Accessibility compliant

### Delete Confirmation
- Modal dialog with "Yes/No" options
- Prevents accidental deletions
- Accessible with proper ARIA attributes

## 🔒 Accessibility Features

This application follows WCAG 2.1 AA guidelines and includes:

- **Semantic HTML** - Proper heading hierarchy and structure
- **ARIA Roles** - Comprehensive role attributes for all interactive elements
- **Screen Reader Support** - Proper labels, descriptions, and live regions
- **Keyboard Navigation** - Full keyboard accessibility
- **Focus Management** - Clear focus indicators and logical tab order
- **Color Contrast** - Sufficient contrast ratios for text readability

## 🗄️ Database Schema

```sql
CREATE TABLE training_sessions (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  title TEXT NOT NULL,
  description TEXT NOT NULL,
  status TEXT NOT NULL CHECK(status IN ('Pending', 'In Progress', 'Completed')),
  duration REAL,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
);
```

## 🔌 API Endpoints

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/health` | Health check |
| GET | `/api/sessions` | Get all sessions |
| GET | `/api/sessions/:id` | Get session by ID |
| POST | `/api/sessions` | Create new session |
| PUT | `/api/sessions/:id` | Update session |
| DELETE | `/api/sessions/:id` | Delete session |

## 🎨 UI Components

### Buttons
- Primary buttons with gradient backgrounds
- Secondary buttons for cancel actions
- Delete buttons with confirmation
- Hover effects and transitions

### Forms
- Input fields with proper labels
- Help text and validation
- Accessible form structure
- Loading states and error handling

### Modals
- Confirmation dialogs
- Backdrop blur effects
- Proper focus management
- Keyboard navigation support

## 🧪 Test Coverage

### Frontend Tests
- Component rendering and interactions
- Navigation and routing
- Form validation and submission
- Accessibility compliance
- Responsive design

### Backend Tests
- API endpoint functionality
- CRUD operations
- Input validation
- Error handling
- Database operations

### Integration Tests
- Frontend-backend communication
- End-to-end user workflows
- Data persistence
- Error scenarios

## 🚀 Development Workflow

1. **Make Changes** - Modify frontend or backend code
2. **Run Tests** - Ensure all tests pass
3. **Check Accessibility** - Verify ARIA roles and labels
4. **Test Integration** - Verify frontend-backend communication
5. **Commit Changes** - Use descriptive commit messages

## 📚 API Examples

### Create a Session
```bash
curl -X POST http://localhost:3001/api/sessions \
  -H "Content-Type: application/json" \
  -d '{
    "title": "New Training Session",
    "description": "Description of the session",
    "status": "Pending",
    "duration": 2.5
  }'
```

### Get All Sessions
```bash
curl http://localhost:3001/api/sessions
```

### Delete a Session
```bash
curl -X DELETE http://localhost:3001/api/sessions/1
```

## 🐛 Troubleshooting

### Common Issues

1. **Backend won't start**
   - Check if port 3001 is available
   - Ensure all dependencies are installed
   - Run `npm run init-db` to initialize database

2. **Frontend can't connect to backend**
   - Verify backend is running on port 3001
   - Check CORS configuration
   - Ensure API endpoints are accessible

3. **Tests failing**
   - Check if both frontend and backend are running
   - Verify database is initialized
   - Check for any console errors

### Debug Mode

Run tests in debug mode:
```bash
npm run test:debug
```

## 🤝 Contributing

When contributing to this project:

1. **Follow the AI Development Rules** - See `AI_DEVELOPMENT_RULES.md`
2. **Test Every Change** - All modifications must have corresponding tests
3. **Maintain Accessibility** - Ensure proper ARIA roles and labels
4. **Update Documentation** - Keep README and API docs current
5. **Run All Tests** - Verify both frontend and backend tests pass

## 📄 License

This project is licensed under the MIT License.

## 🆘 Support

For questions or issues:
1. Check the troubleshooting section
2. Review the test output for error details
3. Check browser console and backend logs
4. Ensure all services are running correctly

---

**Remember**: This application follows strict accessibility guidelines and testing requirements. Every change must be tested and maintain accessibility compliance.
