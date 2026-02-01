import { Injectable, Injector } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { BehaviorSubject, Observable, catchError, tap, finalize } from 'rxjs';
import { throwError } from 'rxjs';
import { ApiConfigService } from './api-config';
import { AuthService } from './auth.service';

export interface Habit {
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

@Injectable({
  providedIn: 'root'
})
export class HabitService {
  private habitsSubject = new BehaviorSubject<Habit[]>([]);
  public habits$ = this.habitsSubject.asObservable();
  private loadingSubject = new BehaviorSubject<boolean>(false);
  public loading$ = this.loadingSubject.asObservable();

  constructor(
    private http: HttpClient,
    private apiConfig: ApiConfigService,
    private injector: Injector,
    private authService: AuthService
  ) {
    // Load habits when user logs in
    this.authService.currentUser$.subscribe(user => {
      if (user) {
        this.loadHabits();
      } else {
        // Clear habits when user logs out
        this.habitsSubject.next([]);
      }
    });
  }

  /**
   * Load all habits from the API on service initialization
   * Filters habits by current user's userId
   */
  private loadHabits(): void {
    const userId = this.authService.getCurrentUserId();
    if (!userId) {
      console.warn('No user logged in, cannot load habits');
      this.habitsSubject.next([]);
      return;
    }

    this.loadingSubject.next(true);
    this.http.get<Habit[]>(`${this.apiConfig.getHabitsUrl()}?userId=${userId}`)
      .pipe(
        tap(habits => {
          this.habitsSubject.next(habits);
        }),
        catchError(error => {
          console.error('Error loading habits from API:', error);
          this.habitsSubject.next([]);
          return throwError(() => error);
        }),
        finalize(() => this.loadingSubject.next(false))
      )
      .subscribe();
  }

  /**
   * Get all habits as an Observable
   */
  getHabits(): Observable<Habit[]> {
    return this.habits$;
  }

  /**
   * Get current habits snapshot
   */
  getHabitsSync(): Habit[] {
    return this.habitsSubject.getValue();
  }

  /**
   * Add a new habit to the API and update the observable
   */
  addHabit(habit: Omit<Habit, 'id' | 'createdAt' | 'currentStreak' | 'longestStreak' | 'userId'>): Observable<Habit> {
    const userId = this.authService.getCurrentUserId();
    if (!userId) {
      return throwError(() => new Error('No user logged in'));
    }

    const newHabit: Habit = {
      userId,
      createdAt: new Date().toISOString(),
      currentStreak: 0,
      longestStreak: 0,
      ...habit
    };

    return this.http.post<Habit>(this.apiConfig.getHabitsUrl(), newHabit)
      .pipe(
        tap(createdHabit => {
          const currentHabits = this.habitsSubject.getValue();
          this.habitsSubject.next([...currentHabits, createdHabit]);
          // Trigger statistics update
          this.updateStatistics();
        }),
        catchError(error => {
          console.error('Error adding habit:', error);
          return throwError(() => error);
        })
      );
  }

  /**
   * Update an existing habit
   */
  updateHabit(id: string | number, updates: Partial<Habit>): Observable<Habit> {
    const currentHabits = this.habitsSubject.getValue();
    const existingHabit = currentHabits.find(h => h.id === id);
    
    if (!existingHabit) {
      return throwError(() => new Error('Habit not found'));
    }

    // Merge existing habit with updates to prevent data loss
    const updatedHabit = { ...existingHabit, ...updates };
    
    return this.http.put<Habit>(this.apiConfig.getHabitUrl(id), updatedHabit)
      .pipe(
        tap(savedHabit => {
          const index = currentHabits.findIndex(h => h.id === id);
          if (index > -1) {
            const newHabits = [...currentHabits];
            newHabits[index] = savedHabit;
            this.habitsSubject.next(newHabits);
            // Trigger statistics update
            this.updateStatistics();
          }
        }),
        catchError(error => {
          console.error('Error updating habit:', error);
          return throwError(() => error);
        })
      );
  }

  /**
   * Delete a habit by ID
   */
  deleteHabit(id: string | number): Observable<void> {
    return this.http.delete<void>(this.apiConfig.getHabitUrl(id))
      .pipe(
        tap(() => {
          const currentHabits = this.habitsSubject.getValue();
          this.habitsSubject.next(currentHabits.filter(h => h.id !== id));
          // Trigger statistics update after removing from UI
          this.updateStatistics();
        }),
        catchError(error => {
          console.error('Error deleting habit:', error);
          return throwError(() => error);
        })
      );
  }

  /**
   * Mark a habit as completed and update streak
   * Immediately updates UI state for responsive single-click completion
   */
  completeHabit(id: string | number): Observable<Habit> {
    const currentHabits = this.habitsSubject.getValue();
    const habit = currentHabits.find(h => h.id === id);

    if (!habit) {
      return throwError(() => new Error('Habit not found'));
    }

    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const lastCompleted = habit.lastCompletedDate ? new Date(habit.lastCompletedDate) : null;
    if (lastCompleted) {
      lastCompleted.setHours(0, 0, 0, 0);
    }

    // If already completed today, do nothing
    if (lastCompleted && lastCompleted.getTime() === today.getTime()) {
      return new Observable(observer => {
        observer.next(habit);
        observer.complete();
      });
    }

    let updatedHabit = { ...habit };
    updatedHabit.lastCompletedDate = today.toISOString();

    if (!lastCompleted || (today.getTime() - lastCompleted.getTime()) === 86400000) {
      // Streak continues if completed yesterday
      updatedHabit.currentStreak += 1;
    } else {
      // Streak resets if there's a gap
      updatedHabit.currentStreak = 1;
    }

    if (updatedHabit.currentStreak > updatedHabit.longestStreak) {
      updatedHabit.longestStreak = updatedHabit.currentStreak;
    }

    // Optimistically update UI immediately
    const index = currentHabits.findIndex(h => h.id === id);
    if (index > -1) {
      const newHabits = [...currentHabits];
      newHabits[index] = updatedHabit;
      this.habitsSubject.next(newHabits);
    }

    // Then persist to backend
    return this.http.put<Habit>(this.apiConfig.getHabitUrl(id), updatedHabit)
      .pipe(
        tap(savedHabit => {
          // Update with server response to ensure consistency
          const habits = this.habitsSubject.getValue();
          const idx = habits.findIndex(h => h.id === id);
          if (idx > -1) {
            const updated = [...habits];
            updated[idx] = savedHabit;
            this.habitsSubject.next(updated);
          }
          this.updateStatistics();
        }),
        catchError(error => {
          console.error('Error completing habit:', error);
          // Revert on error
          this.habitsSubject.next(currentHabits);
          return throwError(() => error);
        })
      );
  }

  /**
   * Search habits by name or description
   */
  searchHabits(query: string): Observable<Habit[]> {
    if (!query.trim()) {
      return this.habits$;
    }

    return new Observable(observer => {
      this.habits$.subscribe(habits => {
        const lowerQuery = query.toLowerCase();
        const filtered = habits.filter(h =>
          h.name.toLowerCase().includes(lowerQuery) ||
          (h.description && h.description.toLowerCase().includes(lowerQuery))
        );
        observer.next(filtered);
      });
    });
  }

  /**
   * Filter habits by frequency
   */
  filterHabitsByFrequency(frequency: 'daily' | 'weekly' | 'monthly'): Observable<Habit[]> {
    return new Observable(observer => {
      this.habits$.subscribe(habits => {
        observer.next(habits.filter(h => h.frequency === frequency));
      });
    });
  }

  /**
   * Get total number of habits
   */
  getTotalHabits(): Observable<number> {
    return new Observable(observer => {
      this.habits$.subscribe(habits => {
        observer.next(habits.length);
      });
    });
  }

  /**
   * Get count of habits completed today
   */
  getCompletedTodayCount(): Observable<number> {
    return new Observable(observer => {
      this.habits$.subscribe(habits => {
        const today = new Date();
        today.setHours(0, 0, 0, 0);

        const count = habits.filter(h => {
          if (!h.lastCompletedDate) return false;
          const lastCompleted = new Date(h.lastCompletedDate);
          lastCompleted.setHours(0, 0, 0, 0);
          return lastCompleted.getTime() === today.getTime();
        }).length;

        observer.next(count);
      });
    });
  }

  /**
   * Get average streak across all habits
   */
  getAverageStreak(): Observable<number> {
    return new Observable(observer => {
      this.habits$.subscribe(habits => {
        if (habits.length === 0) {
          observer.next(0);
          return;
        }
        const totalStreak = habits.reduce((sum, h) => sum + h.currentStreak, 0);
        observer.next(Math.round(totalStreak / habits.length));
      });
    });
  }

  /**
   * Refresh habits from API
   */
  refresh(): Observable<Habit[]> {
    const userId = this.authService.getCurrentUserId();
    if (!userId) {
      return throwError(() => new Error('No user logged in'));
    }

    this.loadingSubject.next(true);
    return this.http.get<Habit[]>(`${this.apiConfig.getHabitsUrl()}?userId=${userId}`)
      .pipe(
        tap(habits => {
          this.habitsSubject.next(habits);
        }),
        catchError(error => {
          console.error('Error refreshing habits:', error);
          return throwError(() => error);
        }),
        finalize(() => this.loadingSubject.next(false))
      );
  }

  /**
   * Update statistics after habit changes
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
