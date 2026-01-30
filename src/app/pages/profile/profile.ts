import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { HttpClient } from '@angular/common/http';
import { Router } from '@angular/router';
import { MatCardModule } from '@angular/material/card';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';

interface User {
  id: string;
  email: string;
  password: string;
  displayName: string;
  profileColor?: string;
}

@Component({
  selector: 'app-profile',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    ReactiveFormsModule,
    MatCardModule,
    MatFormFieldModule,
    MatInputModule,
    MatButtonModule,
    MatIconModule,
    MatSnackBarModule
  ],
  templateUrl: './profile.html',
  styleUrl: './profile.css',
})
export class Profile implements OnInit {
  profileForm: FormGroup;
  currentUser: User | null = null;
  hidePassword = true;
  isLoading = false;
  selectedColor = '#667eea';

  colors = [
    '#667eea', '#e74c3c', '#2ecc71', '#f39c12', '#9b59b6',
    '#3498db', '#1abc9c', '#e91e63', '#00bcd4', '#ff5722'
  ];

  constructor(
    private fb: FormBuilder,
    private http: HttpClient,
    private router: Router,
    private snackBar: MatSnackBar
  ) {
    this.profileForm = this.fb.group({
      displayName: ['', [Validators.required, Validators.minLength(2)]],
      email: ['', [Validators.required, Validators.email]],
      password: ['', [Validators.minLength(4)]]
    });
  }

  ngOnInit(): void {
    // Get current user from session storage
    const userJson = sessionStorage.getItem('currentUser');
    if (!userJson) {
      this.router.navigate(['/login']);
      return;
    }

    this.currentUser = JSON.parse(userJson);
    if (this.currentUser) {
      this.profileForm.patchValue({
        displayName: this.currentUser.displayName,
        email: this.currentUser.email
      });
      this.selectedColor = this.currentUser.profileColor || '#667eea';
    }
  }

  selectColor(color: string): void {
    this.selectedColor = color;
  }

  onSubmit(): void {
    if (this.profileForm.invalid || !this.currentUser) {
      return;
    }

    this.isLoading = true;

    const updatedUser: any = {
      ...this.currentUser,
      displayName: this.profileForm.value.displayName,
      email: this.profileForm.value.email,
      profileColor: this.selectedColor
    };

    // Only update password if provided
    if (this.profileForm.value.password) {
      updatedUser.password = this.profileForm.value.password;
    }

    this.http.put(`http://localhost:3000/users/${this.currentUser.id}`, updatedUser).subscribe({
      next: (user) => {
        this.isLoading = false;
        this.currentUser = user as User;
        sessionStorage.setItem('currentUser', JSON.stringify(user));
        this.snackBar.open('Profile updated successfully!', 'Close', {
          duration: 3000,
          horizontalPosition: 'center',
          verticalPosition: 'top'
        });
        this.router.navigate(['/home']);
      },
      error: (err) => {
        this.isLoading = false;
        this.snackBar.open('Failed to update profile', 'Close', {
          duration: 3000,
          horizontalPosition: 'center',
          verticalPosition: 'top'
        });
        console.error('Update error:', err);
      }
    });
  }

  togglePasswordVisibility(): void {
    this.hidePassword = !this.hidePassword;
  }

  logout(): void {
    sessionStorage.removeItem('currentUser');
    this.router.navigate(['/login']);
  }
}
