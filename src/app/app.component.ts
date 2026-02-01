import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, RouterOutlet, RouterLink, NavigationEnd } from '@angular/router';
import { MatToolbarModule } from '@angular/material/toolbar';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatSidenavModule } from '@angular/material/sidenav';
import { MatMenuModule } from '@angular/material/menu';
import { filter } from 'rxjs/operators';
import { AuthService, User } from './services/auth.service';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [
    CommonModule,
    RouterOutlet,
    RouterLink,
    MatToolbarModule,
    MatButtonModule,
    MatIconModule,
    MatSidenavModule,
    MatMenuModule
  ],
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.css']
})
export class AppComponent implements OnInit {
  title = 'TaskFlow Pro';
  currentUser: User | null = null;

  menuItems = [
    { label: 'Dashboard', route: '/home', icon: 'home' },
    { label: 'Tasks', route: '/tasks', icon: 'task_alt' },
    { label: 'Habits', route: '/habits', icon: 'favorite' },
    { label: 'About', route: '/about', icon: 'info' }
  ];

  constructor(
    private router: Router,
    private authService: AuthService
  ) {}

  ngOnInit(): void {
    // Subscribe to auth service for reactive user updates
    this.authService.currentUser$.subscribe(user => {
      this.currentUser = user;
    });
    
    // Reload user on navigation (to catch login/logout changes)
    this.router.events.pipe(
      filter(event => event instanceof NavigationEnd)
    ).subscribe(() => {
      this.currentUser = this.authService.getCurrentUser();
    });
  }

  getInitials(): string {
    if (!this.currentUser?.displayName) return '?';
    const names = this.currentUser.displayName.split(' ');
    if (names.length >= 2) {
      return (names[0][0] + names[1][0]).toUpperCase();
    }
    return this.currentUser.displayName.substring(0, 2).toUpperCase();
  }

  logout(): void {
    this.authService.logout();
  }
}
