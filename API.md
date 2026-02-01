#  TaskFlow Pro - API Documentation

## Overview

TaskFlow Pro uses **json-server** as its backend REST API. The application implements user-based data isolation where each user can only access their own tasks and habits.

**Base URL:** `http://localhost:3000`

## 🔧 Backend Setup

### Starting json-server

**Option 1: Using npx (Recommended)**
```bash
npx json-server --watch db.json --port 3000
```

**Option 2: Using npm script**
```bash
npm run server
```

### Server Status
Once running, you'll see:
```
Resources
http://localhost:3000/users
http://localhost:3000/tasks
http://localhost:3000/habits
http://localhost:3000/statistics

Home
http://localhost:3000
```

## Authentication Endpoints

### Login User
**Endpoint:** `GET /users?email={email}&password={password}`

**Description:** Authenticate user with email and password

**Query Parameters:**
- `email` (string, required) - User's email address
- `password` (string, required) - User's password

**Success Response (200):**
```json
[
  {
    "id": "1",
    "email": "demo@taskflow.com",
    "password": "demo1234",
    "displayName": "Demo User",
    "profileColor": "#667eea"
  }
]
```

**Empty Response (200):** `[]` - Invalid credentials

**Example:**
```bash
curl "http://localhost:3000/users?email=demo@taskflow.com&password=demo1234"
```

---

### Check Email Exists
**Endpoint:** `GET /users?email={email}`

**Description:** Check if email is already registered

**Query Parameters:**
- `email` (string, required) - Email to check

**Success Response (200):**
```json
[
  {
    "id": "1",
    "email": "demo@taskflow.com",
    "displayName": "Demo User"
  }
]
```

**Example:**
```bash
curl "http://localhost:3000/users?email=demo@taskflow.com"
```

---

### Register New User
**Endpoint:** `POST /users`

**Description:** Create a new user account

**Request Body:**
```json
{
  "email": "newuser@example.com",
  "password": "password123",
  "displayName": "New User",
  "profileColor": "#667eea"
}
```

**Success Response (201):**
```json
{
  "id": "3",
  "email": "newuser@example.com",
  "password": "password123",
  "displayName": "New User",
  "profileColor": "#667eea"
}
```

**Example:**
```bash
curl -X POST http://localhost:3000/users \
  -H "Content-Type: application/json" \
  -d '{
    "email": "newuser@example.com",
    "password": "password123",
    "displayName": "New User",
    "profileColor": "#667eea"
  }'
```

---

### Update User Profile
**Endpoint:** `PATCH /users/:id`

**Description:** Update user profile information

**URL Parameters:**
- `id` (string, required) - User ID

**Request Body:**
```json
{
  "displayName": "Updated Name",
  "profileColor": "#3498db"
}
```

**Success Response (200):**
```json
{
  "id": "1",
  "email": "demo@taskflow.com",
  "password": "demo1234",
  "displayName": "Updated Name",
  "profileColor": "#3498db"
}
```

**Example:**
```bash
curl -X PATCH http://localhost:3000/users/1 \
  -H "Content-Type: application/json" \
  -d '{"displayName": "Updated Name"}'
```

---

##  Task Endpoints

### Get User's Tasks
**Endpoint:** `GET /tasks?userId={userId}`

**Description:** Get all tasks for a specific user

**Query Parameters:**
- `userId` (string, required) - User's ID

**Success Response (200):**
```json
[
  {
    "id": "6",
    "userId": "1",
    "title": "Refactor authentication module",
    "description": "Clean up and modularize the authentication code",
    "completed": true,
    "createdAt": "2026-01-28T09:15:00Z",
    "priority": "high"
  }
]
```

**Example:**
```bash
curl "http://localhost:3000/tasks?userId=1"
```

---

### Create Task
**Endpoint:** `POST /tasks`

**Description:** Create a new task

**Request Body:**
```json
{
  "userId": "1",
  "title": "Complete project documentation",
  "description": "Write comprehensive docs for the API",
  "completed": false,
  "createdAt": "2026-02-01T10:00:00Z",
  "priority": "high",
  "dueDate": "2026-02-05T23:00:00Z"
}
```

**Success Response (201):**
```json
{
  "id": "22",
  "userId": "1",
  "title": "Complete project documentation",
  "description": "Write comprehensive docs for the API",
  "completed": false,
  "createdAt": "2026-02-01T10:00:00Z",
  "priority": "high",
  "dueDate": "2026-02-05T23:00:00Z"
}
```

**Example:**
```bash
curl -X POST http://localhost:3000/tasks \
  -H "Content-Type: application/json" \
  -d '{
    "userId": "1",
    "title": "Complete project documentation",
    "description": "Write comprehensive docs",
    "completed": false,
    "createdAt": "2026-02-01T10:00:00Z",
    "priority": "high"
  }'
```

---

### Update Task
**Endpoint:** `PUT /tasks/:id`

**Description:** Update an existing task

**URL Parameters:**
- `id` (string, required) - Task ID

**Request Body:**
```json
{
  "id": "6",
  "userId": "1",
  "title": "Updated task title",
  "description": "Updated description",
  "completed": true,
  "createdAt": "2026-01-28T09:15:00Z",
  "priority": "medium"
}
```

**Success Response (200):** Returns updated task

**Example:**
```bash
curl -X PUT http://localhost:3000/tasks/6 \
  -H "Content-Type: application/json" \
  -d '{
    "id": "6",
    "userId": "1",
    "title": "Updated task title",
    "completed": true
  }'
```

---

### Delete Task
**Endpoint:** `DELETE /tasks/:id`

**Description:** Delete a task

**URL Parameters:**
- `id` (string, required) - Task ID

**Success Response (200):** `{}`

**Example:**
```bash
curl -X DELETE http://localhost:3000/tasks/6
```

---
##  Habit Endpoints

### Get User's Habits
**Endpoint:** `GET /habits?userId={userId}`

**Description:** Get all habits for a specific user

**Query Parameters:**
- `userId` (string, required) - User's ID

**Success Response (200):**
```json
[
  {
    "id": "1",
    "userId": "1",
    "name": "Morning Exercise",
    "description": "30 minutes of exercise",
    "frequency": "daily",
    "createdAt": "2026-01-15T08:00:00Z",
    "currentStreak": 1,
    "longestStreak": 15,
    "lastCompletedDate": "2026-01-29T23:00:00.000Z",
    "color": "#000000"
  }
]
```

**Example:**
```bash
curl "http://localhost:3000/habits?userId=1"
```

---

### Create Habit
**Endpoint:** `POST /habits`

**Description:** Create a new habit

**Request Body:**
```json
{
  "userId": "1",
  "name": "Daily Reading",
  "description": "Read for 30 minutes",
  "frequency": "daily",
  "createdAt": "2026-02-01T08:00:00Z",
  "currentStreak": 0,
  "longestStreak": 0,
  "color": "#2196F3"
}
```

**Success Response (201):**
```json
{
  "id": "11",
  "userId": "1",
  "name": "Daily Reading",
  "description": "Read for 30 minutes",
  "frequency": "daily",
  "createdAt": "2026-02-01T08:00:00Z",
  "currentStreak": 0,
  "longestStreak": 0,
  "color": "#2196F3"
}
```

**Example:**
```bash
curl -X POST http://localhost:3000/habits \
  -H "Content-Type: application/json" \
  -d '{
    "userId": "1",
    "name": "Daily Reading",
    "description": "Read for 30 minutes",
    "frequency": "daily",
    "createdAt": "2026-02-01T08:00:00Z",
    "currentStreak": 0,
    "longestStreak": 0,
    "color": "#2196F3"
  }'
```

---

### Update Habit
**Endpoint:** `PUT /habits/:id`

**Description:** Update an existing habit

**URL Parameters:**
- `id` (string, required) - Habit ID

**Request Body:**
```json
{
  "id": "1",
  "userId": "1",
  "name": "Morning Exercise",
  "description": "Updated description",
  "frequency": "daily",
  "currentStreak": 5,
  "longestStreak": 15,
  "lastCompletedDate": "2026-02-01T08:00:00Z",
  "color": "#4CAF50"
}
```

**Success Response (200):** Returns updated habit

**Example:**
```bash
curl -X PUT http://localhost:3000/habits/1 \
  -H "Content-Type: application/json" \
  -d '{
    "currentStreak": 5,
    "lastCompletedDate": "2026-02-01T08:00:00Z"
  }'
```

---

### Delete Habit
**Endpoint:** `DELETE /habits/:id`

**Description:** Delete a habit

**URL Parameters:**
- `id` (string, required) - Habit ID

**Success Response (200):** `{}`

**Example:**
```bash
curl -X DELETE http://localhost:3000/habits/1
```

---

##  Statistics Endpoints

### Get All Statistics
**Endpoint:** `GET /statistics`

**Description:** Get all statistics entries

**Success Response (200):**
```json
[
  {
    "id": "1",
    "date": "2026-01-28",
    "tasksCompleted": 2,
    "tasksCreated": 6,
    "habitsCompleted": 4,
    "habitsTotal": 6,
    "averageStreak": 4
  }
]
```

**Example:**
```bash
curl http://localhost:3000/statistics
```

---

### Create Statistics Entry
**Endpoint:** `POST /statistics`

**Description:** Create a new statistics entry

**Request Body:**
```json
{
  "date": "2026-02-01",
  "tasksCompleted": 3,
  "tasksCreated": 8,
  "habitsCompleted": 5,
  "habitsTotal": 7,
  "averageStreak": 6
}
```

**Success Response (201):** Returns created statistics

---

### Update Statistics
**Endpoint:** `PUT /statistics/:id`

**Description:** Update existing statistics

**URL Parameters:**
- `id` (string, required) - Statistics ID

**Request Body:** Updated statistics object

**Success Response (200):** Returns updated statistics

---

##  Data Models

### User Model
```typescript
interface User {
  id: string;
  email: string;
  password: string;
  displayName: string;
  profileColor?: string;
}
```

### Task Model
```typescript
interface Task {
  id?: string | number;
  userId: string;
  title: string;
  description?: string;
  completed: boolean;
  createdAt: string | Date;
  dueDate?: string | Date;
  priority?: 'low' | 'medium' | 'high' | 'urgent';
}
```

### Habit Model
```typescript
interface Habit {
  id?: string | number;
  userId: string;
  name: string;
  description?: string;
  frequency: 'daily' | 'weekly' | 'monthly';
  createdAt: string | Date;
  currentStreak: number;
  longestStreak: number;
  lastCompletedDate?: string | Date;
  color?: string;
}
```

### Statistics Model
```typescript
interface Statistics {
  id?: string | number;
  date: string;
  tasksCompleted: number;
  tasksCreated: number;
  habitsCompleted: number;
  habitsTotal: number;
  averageStreak: number;
}
```

##  Query Parameters

json-server supports powerful query parameters:

### Filtering
```bash
# Get tasks for specific user
GET /tasks?userId=1

# Get completed tasks
GET /tasks?completed=true

# Multiple filters
GET /tasks?userId=1&completed=false
```

### Sorting
```bash
# Sort by createdAt descending
GET /tasks?_sort=createdAt&_order=desc

# Sort by priority ascending
GET /tasks?_sort=priority&_order=asc
```

### Pagination
```bash
# Get page 1 with 10 items
GET /tasks?_page=1&_limit=10

# Get items 5-10
GET /tasks?_start=5&_end=10
```

### Full-text Search
```bash
# Search in all fields
GET /tasks?q=documentation
```

##  Security Considerations

### Current Implementation (Development)
- Uses query parameter filtering for user isolation
- Passwords stored in plain text in db.json
- No authentication tokens
- **Not suitable for production**

### Production Recommendations
1. **Use JWT tokens** for authentication
2. **Hash passwords** (bcrypt, argon2)
3. **Implement middleware** for authorization
4. **Use HTTPS** for secure communication
5. **Add rate limiting** to prevent abuse
6. **Validate all inputs** on server side
7. **Use environment variables** for sensitive config

## Testing the API

### Using curl
```bash
# Test login
curl "http://localhost:3000/users?email=demo@taskflow.com&password=demo1234"

# Create a task
curl -X POST http://localhost:3000/tasks \
  -H "Content-Type: application/json" \
  -d '{"userId":"1","title":"Test","completed":false,"createdAt":"2026-02-01T10:00:00Z"}'

# Get user's tasks
curl "http://localhost:3000/tasks?userId=1"
```

### Using Postman
1. Import the endpoints into Postman
2. Set base URL to `http://localhost:3000`
3. Test each endpoint with sample data

### Using Browser
Navigate to:
- http://localhost:3000/tasks
- http://localhost:3000/habits
- http://localhost:3000/users

##  Service Integration

### Angular Services

The application includes pre-configured services:

- **AuthService** - Handles authentication
- **TaskService** - Manages tasks with user filtering
- **HabitService** - Manages habits with user filtering
- **StatisticsService** - Calculates statistics
- **ApiConfigService** - Centralized API configuration

### Example Usage in Components

```typescript
// Login
this.authService.login(email, password).subscribe(users => {
  if (users.length > 0) {
    // Login successful
  }
});

// Get user's tasks
this.taskService.tasks$.subscribe(tasks => {
  console.log('User tasks:', tasks);
});

// Create task
this.taskService.addTask({
  title: 'New Task',
  description: 'Description',
  completed: false
}).subscribe();
```

##  Troubleshooting

### json-server not starting
```bash
# Install json-server
npm install --save-dev json-server

# Start with npx
npx json-server --watch db.json --port 3000
```

### CORS Issues
json-server enables CORS by default. If issues persist:
```bash
npx json-server --watch db.json --port 3000 --middlewares ./middleware.js
```

### Port Already in Use
```bash
# Use different port
npx json-server --watch db.json --port 3001
```

### Data Not Persisting
- Ensure db.json is not read-only
- Check file permissions
- Verify json-server has write access

---

**For complete implementation details, see [README.md](./README.md)**


Then navigate to `http://localhost:4200/`

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

All HTTP requests include error handling:

```typescript
this.http.get<Task[]>(this.apiUrl)
  .pipe(
    tap(tasks => {
      // Update data
    }),
       catchError(error => {
      console.error('Error loading data from API:', error);
      return throwError(() => error);
    })
  )
  .subscribe();
```

## Development Notes

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
