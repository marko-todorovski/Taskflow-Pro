import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { MatCardModule } from '@angular/material/card';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';
import { AuthService, User } from '../../services/auth.service';

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
    private router: Router,
    private snackBar: MatSnackBar,
    private authService: AuthService
  ) {
    this.profileForm = this.fb.group({
      displayName: ['', [Validators.required, Validators.minLength(2)]],
      email: ['', [Validators.required, Validators.email]],
      password: ['', [Validators.minLength(4)]]
    });
  }

  ngOnInit(): void {
    // Get current user from AuthService
    this.currentUser = this.authService.getCurrentUser();
    if (!this.currentUser) {
      this.router.navigate(['/login']);
      return;
    }

    this.profileForm.patchValue({
      displayName: this.currentUser.displayName,
      email: this.currentUser.email
    });
    this.selectedColor = this.currentUser.profileColor || '#667eea';
  }

  selectColor(color: string): void {
    this.selectedColor = color;
  }

  onSubmit(): void {
    if (this.profileForm.invalid || !this.currentUser) {
      return;
    }

    this.isLoading = true;

    const updates: any = {
      displayName: this.profileForm.value.displayName,
      email: this.profileForm.value.email,
      profileColor: this.selectedColor
    };

    // Only update password if provided
    if (this.profileForm.value.password) {
      updates.password = this.profileForm.value.password;
    }

    this.authService.updateProfile(this.currentUser.id, updates).subscribe({
      next: (user) => {
        this.isLoading = false;
        this.currentUser = user;
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
    this.authService.logout();
  }
}
