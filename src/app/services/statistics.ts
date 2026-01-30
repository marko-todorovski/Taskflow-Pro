import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { BehaviorSubject, Observable, catchError, tap, finalize, forkJoin, map, switchMap } from 'rxjs';
import { throwError, of } from 'rxjs';
import { ApiConfigService } from './api-config';
import { TaskService } from './task';
import { HabitService } from './habit';

export interface Statistics {
  id?: string | number;
  date: string;
  tasksCompleted: number;
  tasksCreated: number;
  habitsCompleted: number;
  habitsTotal: number;
  averageStreak: number;
}

@Injectable({
  providedIn: 'root'
})
export class StatisticsService {
  private statisticsSubject = new BehaviorSubject<Statistics[]>([]);
  public statistics$ = this.statisticsSubject.asObservable();
  private loadingSubject = new BehaviorSubject<boolean>(false);
  public loading$ = this.loadingSubject.asObservable();

  constructor(
    private http: HttpClient,
    private apiConfig: ApiConfigService,
    private taskService: TaskService,
    private habitService: HabitService
  ) {
    this.loadStatistics();
  }

  /**
   * Load all statistics from the API on service initialization
   */
  private loadStatistics(): void {
    this.loadingSubject.next(true);
    this.http.get<Statistics[]>(this.apiConfig.getStatisticsUrl())
      .pipe(
        tap(stats => {
          this.statisticsSubject.next(stats);
        }),
        catchError(error => {
          console.error('Error loading statistics from API:', error);
          this.statisticsSubject.next([]);
          return throwError(() => error);
        }),
        finalize(() => this.loadingSubject.next(false))
      )
      .subscribe();
  }

  /**
   * Get all statistics as an Observable
   */
  getStatistics(): Observable<Statistics[]> {
    return this.statistics$;
  }

  /**
   * Get current statistics snapshot
   */
  getStatisticsSync(): Statistics[] {
    return this.statisticsSubject.getValue();
  }

  /**
   * Get statistics for a specific date
   */
  getStatisticsByDate(date: string): Observable<Statistics | undefined> {
    return new Observable(observer => {
      this.statistics$.subscribe(stats => {
        const stat = stats.find(s => s.date === date);
        observer.next(stat);
      });
    });
  }

  /**
   * Add a new statistics entry to the API and update the observable
   */
  addStatistic(statistic: Omit<Statistics, 'id'>): Observable<Statistics> {
    return this.http.post<Statistics>(this.apiConfig.getStatisticsUrl(), statistic)
      .pipe(
        tap(createdStat => {
          const currentStats = this.statisticsSubject.getValue();
          this.statisticsSubject.next([...currentStats, createdStat]);
        }),
        catchError(error => {
          console.error('Error adding statistic:', error);
          return throwError(() => error);
        })
      );
  }

  /**
   * Update an existing statistics entry
   */
  updateStatistic(id: string | number, updates: Partial<Statistics>): Observable<Statistics> {
    return this.http.put<Statistics>(this.apiConfig.getStatisticUrl(id), updates)
      .pipe(
        tap(updatedStat => {
          const currentStats = this.statisticsSubject.getValue();
          const index = currentStats.findIndex(s => s.id === id);
          if (index > -1) {
            const newStats = [...currentStats];
            newStats[index] = updatedStat;
            this.statisticsSubject.next(newStats);
          }
        }),
        catchError(error => {
          console.error('Error updating statistic:', error);
          return throwError(() => error);
        })
      );
  }

  /**
   * Delete a statistics entry by ID
   */
  deleteStatistic(id: string | number): Observable<void> {
    return this.http.delete<void>(this.apiConfig.getStatisticUrl(id))
      .pipe(
        tap(() => {
          const currentStats = this.statisticsSubject.getValue();
          this.statisticsSubject.next(currentStats.filter(s => s.id !== id));
        }),
        catchError(error => {
          console.error('Error deleting statistic:', error);
          return throwError(() => error);
        })
      );
  }

  /**
   * Get today's statistics
   */
  getTodayStatistics(): Observable<Statistics | undefined> {
    const today = new Date().toISOString().split('T')[0];
    return this.getStatisticsByDate(today);
  }

  /**
   * Get statistics for the last N days
   */
  getStatisticsForLastDays(days: number): Observable<Statistics[]> {
    return new Observable(observer => {
      this.statistics$.subscribe(stats => {
        const today = new Date();
        const filtered = stats.filter(s => {
          const statDate = new Date(s.date);
          const daysDiff = (today.getTime() - statDate.getTime()) / (1000 * 60 * 60 * 24);
          return daysDiff <= days;
        }).sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
        observer.next(filtered);
      });
    });
  }

  /**
   * Get average tasks completed across all records
   */
  getAverageTasksCompleted(): Observable<number> {
    return new Observable(observer => {
      this.statistics$.subscribe(stats => {
        if (stats.length === 0) {
          observer.next(0);
          return;
        }
        const total = stats.reduce((sum, s) => sum + s.tasksCompleted, 0);
        observer.next(Math.round(total / stats.length));
      });
    });
  }

  /**
   * Get average habits completed across all records
   */
  getAverageHabitsCompleted(): Observable<number> {
    return new Observable(observer => {
      this.statistics$.subscribe(stats => {
        if (stats.length === 0) {
          observer.next(0);
          return;
        }
        const total = stats.reduce((sum, s) => sum + s.habitsCompleted, 0);
        observer.next(Math.round(total / stats.length));
      });
    });
  }

  /**
   * Get the highest streak value across all records
   */
  getHighestStreak(): Observable<number> {
    return new Observable(observer => {
      this.statistics$.subscribe(stats => {
        if (stats.length === 0) {
          observer.next(0);
          return;
        }
        const max = Math.max(...stats.map(s => s.averageStreak));
        observer.next(max);
      });
    });
  }

  /**
   * Refresh statistics from API
   */
  refresh(): Observable<Statistics[]> {
    this.loadingSubject.next(true);
    return this.http.get<Statistics[]>(this.apiConfig.getStatisticsUrl())
      .pipe(
        tap(stats => {
          this.statisticsSubject.next(stats);
        }),
        catchError(error => {
          console.error('Error refreshing statistics:', error);
          return throwError(() => error);
        }),
        finalize(() => this.loadingSubject.next(false))
      );
  }

  /**
   * Calculate and update today's statistics based on current tasks and habits
   */
  updateTodayStatistics(): Observable<Statistics> {
    const today = new Date().toISOString().split('T')[0];

    return forkJoin({
      tasks: this.taskService.getTasks(),
      habits: this.habitService.getHabits(),
      currentStats: this.statistics$
    }).pipe(
      switchMap(({ tasks, habits, currentStats }) => {
        // Calculate statistics from current data
        const tasksCompleted = tasks.filter(t => t.completed).length;
        const tasksCreated = tasks.length;
        const habitsTotal = habits.length;
        
        // Count habits completed today
        const todayDate = new Date();
        todayDate.setHours(0, 0, 0, 0);
        const habitsCompleted = habits.filter(h => {
          if (!h.lastCompletedDate) return false;
          const lastCompleted = new Date(h.lastCompletedDate);
          lastCompleted.setHours(0, 0, 0, 0);
          return lastCompleted.getTime() === todayDate.getTime();
        }).length;

        // Calculate average streak
        const averageStreak = habitsTotal > 0
          ? Math.round(habits.reduce((sum, h) => sum + h.currentStreak, 0) / habitsTotal)
          : 0;

        const newStats: Statistics = {
          date: today,
          tasksCompleted,
          tasksCreated,
          habitsCompleted,
          habitsTotal,
          averageStreak
        };

        // Check if today's statistics already exist
        const existingStat = currentStats.find(s => s.date === today);

        if (existingStat && existingStat.id) {
          // Update existing record
          return this.updateStatistic(existingStat.id, newStats);
        } else {
          // Create new record
          return this.addStatistic(newStats);
        }
      }),
      catchError(error => {
        console.error('Error updating today\'s statistics:', error);
        return throwError(() => error);
      })
    );
  }
}
