# Training Sessions Backend

This is the backend service for the Champions Training App, providing a RESTful API for managing training sessions with SQLite database storage.

## Features

- **CRUD Operations**: Create, Read, Update, and Delete training sessions
- **SQLite Database**: Lightweight, file-based database
- **RESTful API**: Standard HTTP endpoints for all operations
- **Input Validation**: Server-side validation for data integrity
- **Error Handling**: Comprehensive error handling with appropriate HTTP status codes

## API Endpoints

### Health Check
- `GET /health` - Check if the service is running

### Training Sessions
- `GET /api/sessions` - Get all training sessions
- `GET /api/sessions/:id` - Get a specific training session
- `POST /api/sessions` - Create a new training session
- `PUT /api/sessions/:id` - Update an existing training session
- `DELETE /api/sessions/:id` - Delete a training session

## Data Model

### Training Session
```json
{
  "id": 1,
  "title": "Introduction to Playwright",
  "description": "Learn the basics of Playwright testing framework",
  "status": "Completed",
  "duration": 2.0,
  "created_at": "2024-01-01T10:00:00.000Z",
  "updated_at": "2024-01-01T10:00:00.000Z"
}
```

### Status Values
- `Pending` - Session has not started
- `In Progress` - Session is currently active
- `Completed` - Session has finished

## Setup Instructions

### Prerequisites
- Node.js (v18 or higher)
- npm or yarn

### Installation
1. Navigate to the backend directory:
   ```bash
   cd backend
   ```

2. Install dependencies:
   ```bash
   npm install
   ```

3. Initialize the database:
   ```bash
   npm run init-db
   ```

4. Start the server:
   ```bash
   npm run dev
   ```

The server will start on port 3001 by default.

## Development

### Running in Development Mode
```bash
npm run dev
```

### Running Tests
```bash
npm test
```

### Database Initialization
```bash
npm run init-db
```

## Environment Variables

- `PORT` - Server port (default: 3001)

## Database

The application uses SQLite with a single table `training_sessions`. The database file is created automatically in the backend root directory as `training.db`.

### Database Schema
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

## Testing

The backend includes comprehensive Playwright tests that verify:
- All CRUD operations
- Input validation
- Error handling
- API response formats

Run tests with:
```bash
npm test
```

## API Examples

### Create a Training Session
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

## Error Handling

The API returns appropriate HTTP status codes and error messages:

- `200` - Success
- `201` - Created
- `400` - Bad Request (validation errors)
- `404` - Not Found
- `500` - Internal Server Error

Error responses include a descriptive message:
```json
{
  "error": "Title, description, and status are required"
}
```

## Contributing

When making changes to the backend:
1. Ensure all tests pass
2. Follow the existing code style
3. Add tests for new functionality
4. Update this README if API changes are made
