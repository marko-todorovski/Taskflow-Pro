# TaskFlow Pro - API Documentation

## Overview

TaskFlow Pro includes a mock backend using **json-server** to simulate REST API communication. The application supports both localStorage-based persistence and HTTP API communication.

## Backend Setup

### json-server Mock Backend

The project includes a `db.json` file that serves as the mock database for json-server.

#### Starting the Mock Backend Server

```bash
npm run server
```

This will start json-server on `http://localhost:3000` and watch for changes to `db.json`.

#### API Endpoints

##### Tasks
- **GET** `/tasks` - Get all tasks
- **POST** `/tasks` - Create a new task
- **GET** `/tasks/:id` - Get a specific task
- **PUT** `/tasks/:id` - Update a task
- **DELETE** `/tasks/:id` - Delete a task

##### Habits
- **GET** `/habits` - Get all habits
- **POST** `/habits` - Create a new habit
- **GET** `/habits/:id` - Get a specific habit
- **PUT** `/habits/:id` - Update a habit
- **DELETE** `/habits/:id` - Delete a habit

##### Statistics
- **GET** `/statistics` - Get statistics data
- **POST** `/statistics` - Create statistics entry
- **PUT** `/statistics/:id` - Update statistics

## Data Models

### Task Model

```typescript
interface Task {
  id?: string;
  title: string;
  description?: string;
  completed: boolean;
  createdAt: Date;
  dueDate?: Date;
  priority?: 'low' | 'medium' | 'high';
}
```

### Habit Model

```typescript
interface Habit {
  id?: string;
  name: string;
  description?: string;
  frequency: 'daily' | 'weekly' | 'monthly';
  createdAt: Date;
  currentStreak: number;
  longestStreak: number;
  lastCompletedDate?: Date;
  color?: string;
}
```

## Service Integration

### TaskService

The `TaskService` now supports both localStorage and API communication:

```typescript
// The service automatically tries to use localStorage by default
// If you have json-server running, you can enable API mode:
taskService.setUseAPI(true);

// Switch back to localStorage:
taskService.setUseAPI(false);
```

### HabitService

Similar to `TaskService`, the `HabitService` supports both modes:

```typescript
habitService.setUseAPI(true);  // Use API
habitService.setUseAPI(false); // Use localStorage
```

## Running Both Frontend and Backend

### Terminal 1 - Development Server
```bash
npm start
```

### Terminal 2 - Mock Backend Server
```bash
npm run server
```

Then navigate to `http://localhost:4200/`

## Storage Strategy

The application uses a **hybrid approach**:

1. **Primary Storage**: localStorage (default)
   - Works offline
   - Persists data immediately
   - No network dependency

2. **Secondary Storage**: json-server API
   - Available for server-based operations
   - Can be enabled with `setUseAPI(true)`
   - Falls back to localStorage if API is unavailable

## API Fallback Mechanism

If the API server is not available:
- Services automatically fall back to localStorage
- No data is lost
- Application continues to function normally
- When API becomes available, data can be synchronized

## Sample Data

The `db.json` file includes sample data for testing:

### Sample Tasks
- Complete project documentation (High priority)
- Review pull requests (Medium priority)
- Setup CI/CD pipeline (Completed)
- Fix responsive design issues (Medium priority)
- Update dependencies (Low priority)
- Write unit tests (Completed)

### Sample Habits
- Morning Exercise (Daily, 8-day streak)
- Read a Book (Daily, 5-day streak)
- Meditation (Daily, 3-day streak)
- Drink Water (Daily, 2-day streak)
- Weekly Review (Weekly, 3-week streak)
- Team Meeting Prep (Weekly, 4-week streak)

## HTTP Client Configuration

The application uses Angular's `HttpClient` for API communication:

```typescript
import { HttpClient } from '@angular/common/http';

constructor(private http: HttpClient) { }
```

### Error Handling

All HTTP requests include error handling with fallback to localStorage:

```typescript
this.http.get<Task[]>(this.apiUrl)
  .pipe(
    tap(tasks => {
      // Update data
    }),
    catchError(() => {
      // Fall back to localStorage
      return of(localData);
    })
  )
  .subscribe();
```

## Development Notes

### Switching to API Mode

To enable API communication:

1. Start the json-server:
   ```bash
   npm run server
   ```

2. In your component, enable API mode:
   ```typescript
   constructor(private taskService: TaskService) {
     this.taskService.setUseAPI(true);
   }
   ```

### Monitoring API Calls

json-server provides a web interface at `http://localhost:3000/` where you can:
- View the database
- Edit records
- Monitor API requests

## Environment Configuration

For production deployment, update the API base URL in `api-config.ts`:

```typescript
private apiBaseUrl = 'https://api.example.com'; // Production API
```

## Testing the API

Using curl to test the API:

```bash
# Get all tasks
curl http://localhost:3000/tasks

# Create a task
curl -X POST http://localhost:3000/tasks \
  -H "Content-Type: application/json" \
  -d '{"title":"New Task","completed":false}'

# Update a task
curl -X PUT http://localhost:3000/tasks/1 \
  -H "Content-Type: application/json" \
  -d '{"completed":true}'

# Delete a task
curl -X DELETE http://localhost:3000/tasks/1
```

## Troubleshooting

### "API server not available"
- Ensure json-server is running: `npm run server`
- Check if port 3000 is available
- Verify no firewall blocks the connection

### Data not syncing to API
- Check browser console for errors
- Verify API is running
- Check that `setUseAPI(true)` was called

### Localhost API connection issues
- On Windows, ensure you're using `http://localhost:3000` (not 127.0.0.1)
- Check firewall settings
- Restart the development server

## Next Steps

For production:
1. Replace json-server with a real backend (Node.js, .NET, Java, etc.)
2. Update API base URL in `api-config.ts`
3. Implement authentication/authorization
4. Add data validation on server
5. Set up database (PostgreSQL, MongoDB, etc.)
