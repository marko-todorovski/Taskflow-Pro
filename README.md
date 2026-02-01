#  TaskFlow Pro

A comprehensive task and habit tracking application built with Angular 18+ and json-server, featuring user-based data isolation and real-time updates.

##  Features

-  **User Authentication** - Complete login/register/logout system
-  **User-Specific Data** - Each user sees only their own tasks and habits
-  **Task Management** - Create, update, delete, and track tasks with priorities
-  **Habit Tracking** - Build habits with streak tracking and frequency options
-  **Statistics Dashboard** - View productivity metrics and progress
-  **Responsive Design** - Material Design UI that works on all devices
-  **Real-time Updates** - Reactive programming with RxJS
-  **Data Persistence** - All data stored in json-server

##  Quick Start

### Prerequisites

- Node.js (v18 or higher)
- npm (comes with Node.js)

### Installation

1. **Clone the repository**
```bash
git clone https://github.com/marko-todorovski/Taskflow-Pro.git
cd Taskflow-Pro
```

2. **Install dependencies**
```bash
npm install
```

3. **Install json-server (if not already installed)**
```bash
npm install --save-dev json-server
```

### Running the Application

You need to run **both** the Angular dev server and json-server:

**Terminal 1: Start json-server (Backend)**
```bash
npx json-server --watch db.json --port 3000
```

**Terminal 2: Start Angular (Frontend)**
```bash
npm start
```

Then open your browser to: **http://localhost:4200**

##  Default Users

### Demo User
- **Email:** `demo@taskflow.com`
- **Password:** `demo1234`
- **Data:** 11 tasks and 7 habits

### Admin User
- **Email:** `admin@taskflow.com`
- **Password:** `admin1234`
- **Data:** 6 tasks and 4 habits

### Or Create Your Own
Register a new account at `/register` - you'll start with a clean slate!

##  User-Based System Implementation

### How It Works

This application implements a complete user-based data isolation system:

1. **Authentication Flow**
   - User logs in → AuthService validates credentials
   - User data stored in sessionStorage
   - Services automatically load user-specific data

2. **Data Isolation**
   - All tasks and habits have a `userId` field
   - API queries filter by userId: `GET /tasks?userId=X`
   - Users can ONLY see their own data

3. **Automatic Management**
   - Services inject userId automatically when creating data
   - Reactive updates via RxJS BehaviorSubjects
   - Logout clears all user data from memory
### Key Components

#### 1. AuthService (`src/app/services/auth.service.ts`)
- Centralized authentication management
- Handles login, register, logout
- Provides current user state via Observable
- Methods:
  - `login(email, password)` - Authenticate user
  - `register(displayName, email, password)` - Create new user
  - `logout()` - Clear session and redirect
  - `getCurrentUser()` - Get current user
  - `getCurrentUserId()` - Get user ID

#### 2. TaskService (`src/app/services/task.ts`)
- Manages all task operations
- Automatically filters tasks by userId
- Features:
  - Load tasks on user login
  - Clear tasks on user logout
  - Auto-inject userId when creating tasks
  - Real-time updates via `tasks$` Observable

#### 3. HabitService (`src/app/services/habit.ts`)
- Manages all habit operations
- Automatically filters habits by userId
- Features:
  - Load habits on user login
  - Clear habits on user logout
  - Auto-inject userId when creating habits
  - Streak tracking and completion management

#### 4. StatisticsService (`src/app/services/statistics.ts`)
- Calculates user-specific statistics
- Automatically uses filtered data
- Tracks tasks completed, habits maintained, streaks

### Database Schema

The `db.json` file contains:

```json
{
  "users": [
    {
      "id": "1",
      "email": "demo@taskflow.com",
      "password": "demo1234",
      "displayName": "Demo User",
      "profileColor": "#667eea"
    }
  ],
  "tasks": [
    {
      "id": "6",
      "userId": "1",
      "title": "Task title",
      "description": "Description",
      "completed": false,
      "createdAt": "2026-01-28T09:15:00Z",
      "priority": "high"
    }
  ],
  "habits": [
    {
      "id": "1",
      "userId": "1",
      "name": "Morning Exercise",
      "description": "30 minutes daily",
      "frequency": "daily",
      "createdAt": "2026-01-15T08:00:00Z",
      "currentStreak": 1,
      "longestStreak": 15,
      "color": "#000000"
    }
  ]
}
```

##  Testing Guide

### Test Scenario 1: Login as Existing User
1. Go to http://localhost:4200/login
2. Login as demo user
3. **Expected:** See 11 tasks and 7 habits

### Test Scenario 2: Register New User
1. Navigate to `/register`
2. Fill in registration form
3. Login with new credentials
4. **Expected:** Empty tasks and habits lists

### Test Scenario 3: Data Isolation
1. Login as demo user, note their data
2. Logout and login as admin user
3. **Expected:** See admin's data, NOT demo's data

### Test Scenario 4: Create and Delete
1. Login as any user
2. Create a new task/habit
3. Refresh the page
4. **Expected:** Task/habit persists
5. Delete the task/habit
6. **Expected:** Removed immediately

### Test Scenario 5: Session Persistence
1. Login to the application
2. Refresh the page (F5)
3. **Expected:** Still logged in, data still visible

##  Security Features

### Data Isolation
- Query parameter filtering (`?userId=X`)
- Automatic userId injection
- Service-level filtering
- Session-based authentication

### What Prevents Cross-User Access
- json-server only returns user's own data
- No direct API access from components
- Services automatically inject userId
- User ID comes from authenticated session
- Logout immediately clears all data


### Code Scaffolding

Generate a new component:
```bash
ng generate component component-name
```

Generate a new service:
```bash
ng generate service service-name
```

### Building for Production

```bash
ng build
```

Build artifacts will be stored in the `dist/` directory.

### Running Tests

```bash
ng test
```

##  API Endpoints

See [API.md](./API.md) for complete API documentation.

### Quick Reference

#### Authentication
- `GET /users?email=X&password=Y` - Login
- `GET /users?email=X` - Check email exists
- `POST /users` - Register
- `PATCH /users/:id` - Update profile

#### Tasks (User-Filtered)
- `GET /tasks?userId=X` - Get user's tasks
- `POST /tasks` - Create task (with userId)
- `PUT /tasks/:id` - Update task
- `DELETE /tasks/:id` - Delete task

#### Habits (User-Filtered)
- `GET /habits?userId=X` - Get user's habits
- `POST /habits` - Create habit (with userId)
- `PUT /habits/:id` - Update habit
- `DELETE /habits/:id` - Delete habit

##  Technologies Used

- **Angular 18+** - Frontend framework with standalone components
- **RxJS** - Reactive programming
- **Angular Material** - UI components
- **TypeScript** - Type-safe development
- **json-server** - Mock REST API
- **SCSS** - Styling

##  Key Implementation Details

### Reactive State Management
- BehaviorSubjects for current state
- Observables for async operations
- Automatic UI updates on data changes

### Service Architecture
- Dependency injection
- Single responsibility principle
- Centralized business logic

### Type Safety
- Full TypeScript interfaces
- Strict type checking
- IntelliSense support

## Troubleshooting

### json-server not found
```bash
npm install --save-dev json-server
```

### Port already in use
Change the port in the command:
```bash
npx json-server --watch db.json --port 3001
```

Then update `api-config.ts`:
```typescript
private apiUrl = 'http://localhost:3001';
```

### Login not working
1. Verify json-server is running on port 3000
2. Check browser console for errors
3. Verify user credentials in db.json

### Data not loading
1. Check Network tab in DevTools
2. Verify API responses
3. Check console for errors
4. Ensure user is logged in

##  Contributing

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit your changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

## License

This project is part of a learning exercise.

##  Acknowledgments

- Angular team for the amazing framework
- Material Design for UI components
- json-server for easy mock backend

---

**Built with  using Angular 18+**

For more details, see:
- [API Documentation](./API.md)
- [Architecture Details](./ARCHITECTURE.md)


```bash
ng e2e
```

Angular CLI does not come with an end-to-end testing framework by default. You can choose one that suits your needs.

## Additional Resources

For more information on using the Angular CLI, including detailed command references, visit the [Angular CLI Overview and Command Reference](https://angular.dev/tools/cli) page.
