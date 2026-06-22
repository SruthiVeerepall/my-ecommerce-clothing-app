import { Component, signal } from '@angular/core';
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
  code = '';

  showPassword = false;
  showConfirmPassword = false;

  errorMessage = signal('');
  infoMessage = signal('');
  loading = signal(false);
  awaitingCode = signal(false);
  showSuccessModal = signal(false);

  // Email tied to the pending signup (used for verify/resend).
  private pendingEmail = '';

  constructor(private authService: AuthService, private router: Router) {}

  togglePasswordVisibility() {
    this.showPassword = !this.showPassword;
  }

  toggleConfirmPasswordVisibility() {
    this.showConfirmPassword = !this.showConfirmPassword;
  }

  onSubmit() {
    if (!this.user.username || !this.user.email || !this.user.password || !this.user.confirmPassword) {
      this.errorMessage.set('Please fill in all fields');
      return;
    }

    if (this.user.password !== this.user.confirmPassword) {
      this.errorMessage.set('Passwords do not match');
      return;
    }

    if (this.user.password.length < 6) {
      this.errorMessage.set('Password must be at least 6 characters long');
      return;
    }

    this.loading.set(true);
    this.errorMessage.set('');

    const { confirmPassword, ...userData } = this.user;

    this.authService.register(userData).subscribe({
      next: (response) => {
        this.loading.set(false);
        this.pendingEmail = this.user.email;
        this.awaitingCode.set(true);
        this.infoMessage.set(response?.message || `A verification code has been sent to ${this.user.email}.`);
      },
      error: (error) => {
        this.errorMessage.set(error.error?.message || 'Registration failed');
        this.loading.set(false);
      },
    });
  }

  onVerify() {
    const code = this.code.trim();
    if (!code) {
      this.errorMessage.set('Please enter the verification code');
      return;
    }

    this.loading.set(true);
    this.errorMessage.set('');

    this.authService.verifyEmail(this.pendingEmail, code).subscribe({
      next: () => {
        this.loading.set(false);
        this.showSuccessModal.set(true);
      },
      error: (error) => {
        this.errorMessage.set(error.error?.message || 'Verification failed');
        this.loading.set(false);
      },
    });
  }

  onResend() {
    this.errorMessage.set('');
    this.infoMessage.set('');
    this.authService.resendCode(this.pendingEmail).subscribe({
      next: (response) => {
        this.infoMessage.set(response?.message || 'A new verification code has been sent.');
      },
      error: (error) => {
        this.errorMessage.set(error.error?.message || 'Could not resend the code');
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
