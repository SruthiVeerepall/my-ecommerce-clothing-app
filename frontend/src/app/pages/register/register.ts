import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { AuthService } from '../../services/auth.service';

@Component({
  selector: 'app-register',
  imports: [CommonModule, FormsModule],
  templateUrl: './register.html',
  styleUrl: './register.css',
})
export class Register {
  user = {
    username: '',
    email: '',
    password: '',
    confirmPassword: '',
  };
  errorMessage = '';
  showSuccessModal = false;
  loading = false;

  constructor(private authService: AuthService, private router: Router) {}

  onSubmit() {
    if (!this.user.username || !this.user.email || !this.user.password || !this.user.confirmPassword) {
      this.errorMessage = 'Please fill in all fields';
      return;
    }

    if (this.user.password !== this.user.confirmPassword) {
      this.errorMessage = 'Passwords do not match';
      return;
    }

    if (this.user.password.length < 6) {
      this.errorMessage = 'Password must be at least 6 characters long';
      return;
    }

    this.loading = true;
    this.errorMessage = '';

    const { confirmPassword, ...userData } = this.user;

    this.authService.register(userData).subscribe({
      next: () => {
        this.loading = false;
        this.showSuccessModal = true;
      },
      error: (error) => {
        this.errorMessage = error.error?.message || 'Registration failed';
        this.loading = false;
      },
    });
  }

  onOverlayClick(event: MouseEvent) {
    if ((event.target as HTMLElement).classList.contains('modal-overlay')) {
      this.navigateToLogin();
    }
  }

  navigateToLogin() {
    this.router.navigate(['/login']);
  }
}