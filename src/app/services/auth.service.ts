import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { BehaviorSubject, Observable, throwError } from 'rxjs';
import { tap, catchError } from 'rxjs/operators';
import { Router } from '@angular/router';

export interface User {
  id: string;
  email: string;
  password?: string;
  displayName: string;
  profileColor?: string;
}

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  private currentUserSubject = new BehaviorSubject<User | null>(null);
  public currentUser$ = this.currentUserSubject.asObservable();
  private apiUrl = 'http://localhost:3000';

  constructor(
    private http: HttpClient,
    private router: Router
  ) {
    // Load user from sessionStorage on service initialization
    this.loadUserFromSession();
  }

  /**
   * Load user from sessionStorage if exists
   */
  private loadUserFromSession(): void {
    const userJson = sessionStorage.getItem('currentUser');
    if (userJson) {
      try {
        const user = JSON.parse(userJson);
        this.currentUserSubject.next(user);
      } catch (error) {
        console.error('Error parsing user from sessionStorage:', error);
        sessionStorage.removeItem('currentUser');
      }
    }
  }

  /**
   * Get current user snapshot
   */
  getCurrentUser(): User | null {
    return this.currentUserSubject.getValue();
  }

  /**
   * Get current user's ID
   */
  getCurrentUserId(): string | null {
    const user = this.currentUserSubject.getValue();
    return user ? user.id : null;
  }

  /**
   * Check if user is logged in
   */
  isLoggedIn(): boolean {
    return this.currentUserSubject.getValue() !== null;
  }

  /**
   * Login user with email and password
   */
  login(email: string, password: string): Observable<User[]> {
    return this.http.get<User[]>(
      `${this.apiUrl}/users?email=${encodeURIComponent(email)}&password=${encodeURIComponent(password)}`
    ).pipe(
      tap(users => {
        if (users && users.length > 0) {
          const user = users[0];
          // Remove password from stored user object
          const { password, ...userWithoutPassword } = user;
          sessionStorage.setItem('currentUser', JSON.stringify(userWithoutPassword));
          this.currentUserSubject.next(userWithoutPassword);
        }
      }),
      catchError(error => {
        console.error('Login error:', error);
        return throwError(() => error);
      })
    );
  }

  /**
   * Register a new user
   */
  register(displayName: string, email: string, password: string, profileColor?: string): Observable<User> {
    const newUser = {
      email,
      password,
      displayName,
      profileColor: profileColor || this.generateRandomColor()
    };

    return this.http.post<User>(`${this.apiUrl}/users`, newUser).pipe(
      tap(createdUser => {
        console.log('User registered successfully:', createdUser);
      }),
      catchError(error => {
        console.error('Registration error:', error);
        return throwError(() => error);
      })
    );
  }

  /**
   * Check if email already exists
   */
  checkEmailExists(email: string): Observable<User[]> {
    return this.http.get<User[]>(
      `${this.apiUrl}/users?email=${encodeURIComponent(email)}`
    );
  }

  /**
   * Logout current user
   */
  logout(): void {
    sessionStorage.removeItem('currentUser');
    this.currentUserSubject.next(null);
    this.router.navigate(['/login']);
  }

  /**
   * Generate a random profile color
   */
  private generateRandomColor(): string {
    const colors = [
      '#667eea', '#e74c3c', '#3498db', '#2ecc71', '#f39c12',
      '#9b59b6', '#1abc9c', '#e67e22', '#34495e', '#c0392b'
    ];
    return colors[Math.floor(Math.random() * colors.length)];
  }

  /**
   * Update current user's profile
   */
  updateProfile(userId: string, updates: Partial<User>): Observable<User> {
    return this.http.patch<User>(`${this.apiUrl}/users/${userId}`, updates).pipe(
      tap(updatedUser => {
        const { password, ...userWithoutPassword } = updatedUser;
        sessionStorage.setItem('currentUser', JSON.stringify(userWithoutPassword));
        this.currentUserSubject.next(userWithoutPassword);
      }),
      catchError(error => {
        console.error('Update profile error:', error);
        return throwError(() => error);
      })
    );
  }
}
