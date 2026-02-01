import { Injectable, Injector } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { BehaviorSubject, Observable, catchError, tap, finalize } from 'rxjs';
import { throwError } from 'rxjs';
import { ApiConfigService } from './api-config';
import { AuthService } from './auth.service';

export interface Task {
  id?: string | number;
  userId: string;
  title: string;
  description?: string;
  completed: boolean;
  createdAt: string | Date;
  dueDate?: string | Date;
  priority?: 'low' | 'medium' | 'high';
}

@Injectable({
  providedIn: 'root'
})
export class TaskService {
  private tasksSubject = new BehaviorSubject<Task[]>([]);
  public tasks$ = this.tasksSubject.asObservable();
  private loadingSubject = new BehaviorSubject<boolean>(false);
  public loading$ = this.loadingSubject.asObservable();

  constructor(
    private http: HttpClient,
    private apiConfig: ApiConfigService,
    private injector: Injector,
    private authService: AuthService
  ) {
    // Load tasks when user logs in
    this.authService.currentUser$.subscribe(user => {
      if (user) {
        this.loadTasks();
      } else {
        // Clear tasks when user logs out
        this.tasksSubject.next([]);
      }
    });
  }

  /**
   * Load all tasks from the API on service initialization
   * Filters tasks by current user's userId
   */
  private loadTasks(): void {
    const userId = this.authService.getCurrentUserId();
    if (!userId) {
      console.warn('No user logged in, cannot load tasks');
      this.tasksSubject.next([]);
      return;
    }

    this.loadingSubject.next(true);
    this.http.get<Task[]>(`${this.apiConfig.getTasksUrl()}?userId=${userId}`)
      .pipe(
        tap(tasks => {
          this.tasksSubject.next(tasks);
        }),
        catchError(error => {
          console.error('Error loading tasks from API:', error);
          this.tasksSubject.next([]);
          return throwError(() => error);
        }),
        finalize(() => this.loadingSubject.next(false))
      )
      .subscribe();
  }

  /**
   * Get all tasks as an Observable
   */
  getTasks(): Observable<Task[]> {
    return this.tasks$;
  }

  /**
   * Get current tasks snapshot
   */
  getTasksSync(): Task[] {
    return this.tasksSubject.getValue();
  }

  /**
   * Add a new task to the API and update the observable
   */
  addTask(task: Omit<Task, 'id' | 'createdAt' | 'userId'>): Observable<Task> {
    const userId = this.authService.getCurrentUserId();
    if (!userId) {
      return throwError(() => new Error('No user logged in'));
    }

    const newTask: Task = {
      userId,
      createdAt: new Date().toISOString(),
      ...task
    };

    return this.http.post<Task>(this.apiConfig.getTasksUrl(), newTask)
      .pipe(
        tap(createdTask => {
          const currentTasks = this.tasksSubject.getValue();
          this.tasksSubject.next([...currentTasks, createdTask]);
          // Trigger statistics update
          this.updateStatistics();
        }),
        catchError(error => {
          console.error('Error adding task:', error);
          return throwError(() => error);
        })
      );
  }

  /**
   * Update an existing task
   */
  updateTask(id: string | number, updates: Partial<Task>): Observable<Task> {
    const currentTasks = this.tasksSubject.getValue();
    const existingTask = currentTasks.find(t => t.id === id);
    
    if (!existingTask) {
      return throwError(() => new Error('Task not found'));
    }

    // Merge existing task with updates to prevent data loss
    const updatedTask = { ...existingTask, ...updates };
    
    return this.http.put<Task>(this.apiConfig.getTaskUrl(id), updatedTask)
      .pipe(
        tap(savedTask => {
          const index = currentTasks.findIndex(t => t.id === id);
          if (index > -1) {
            const newTasks = [...currentTasks];
            newTasks[index] = savedTask;
            this.tasksSubject.next(newTasks);
            // Trigger statistics update
            this.updateStatistics();
          }
        }),
        catchError(error => {
          console.error('Error updating task:', error);
          return throwError(() => error);
        })
      );
  }

  /**
   * Delete a task by ID
   */
  deleteTask(id: string | number): Observable<void> {
    return this.http.delete<void>(this.apiConfig.getTaskUrl(id))
      .pipe(
        tap(() => {
          const currentTasks = this.tasksSubject.getValue();
          this.tasksSubject.next(currentTasks.filter(t => t.id !== id));
          // Trigger statistics update after removing from UI
          this.updateStatistics();
        }),
        catchError(error => {
          console.error('Error deleting task:', error);
          return throwError(() => error);
        })
      );
  }

  /**
   * Toggle the completed status of a task
   */
  toggleTask(id: string | number): Observable<Task> {
    const currentTasks = this.tasksSubject.getValue();
    const task = currentTasks.find(t => t.id === id);
    
    if (!task) {
      return throwError(() => new Error('Task not found'));
    }

    const updatedTask = { ...task, completed: !task.completed };
    return this.updateTask(id, { completed: updatedTask.completed });
  }

  /**
   * Search tasks by title or description
   */
  searchTasks(query: string): Observable<Task[]> {
    if (!query.trim()) {
      return this.tasks$;
    }

    return new Observable(observer => {
      this.tasks$.subscribe(tasks => {
        const lowerQuery = query.toLowerCase();
        const filtered = tasks.filter(t =>
          t.title.toLowerCase().includes(lowerQuery) ||
          (t.description && t.description.toLowerCase().includes(lowerQuery))
        );
        observer.next(filtered);
      });
    });
  }

  /**
   * Filter tasks by completion status
   */
  filterTasksByStatus(completed: boolean): Observable<Task[]> {
    return new Observable(observer => {
      this.tasks$.subscribe(tasks => {
        observer.next(tasks.filter(t => t.completed === completed));
      });
    });
  }

  /**
   * Get count of completed tasks
   */
  getCompletedTasksCount(): Observable<number> {
    return new Observable(observer => {
      this.tasks$.subscribe(tasks => {
        observer.next(tasks.filter(t => t.completed).length);
      });
    });
  }

  /**
   * Get total count of tasks
   */
  getTotalTasksCount(): Observable<number> {
    return new Observable(observer => {
      this.tasks$.subscribe(tasks => {
        observer.next(tasks.length);
      });
    });
  }

  /**
   * Refresh tasks from API
   */
  refresh(): Observable<Task[]> {
    const userId = this.authService.getCurrentUserId();
    if (!userId) {
      return throwError(() => new Error('No user logged in'));
    }

    this.loadingSubject.next(true);
    return this.http.get<Task[]>(`${this.apiConfig.getTasksUrl()}?userId=${userId}`)
      .pipe(
        tap(tasks => {
          this.tasksSubject.next(tasks);
        }),
        catchError(error => {
          console.error('Error refreshing tasks:', error);
          return throwError(() => error);
        }),
        finalize(() => this.loadingSubject.next(false))
      );
  }

  /**
   * Update statistics after task changes
   */
  private updateStatistics(): void {
    // Delay to ensure the change is persisted and avoid circular dependency
    setTimeout(async () => {
      try {
        const { StatisticsService } = await import('./statistics');
        const statisticsService = this.injector.get(StatisticsService);
        statisticsService.updateTodayStatistics().subscribe({
          next: () => console.log('✅ Statistics updated'),
          error: (err) => console.error('❌ Error updating statistics:', err)
        });
      } catch (error) {
        console.error('Failed to load statistics service:', error);
      }
    }, 500);
  }
}

