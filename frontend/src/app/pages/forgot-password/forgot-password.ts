import { Component, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { AuthService } from '../../services/auth.service';

@Component({
  selector: 'app-forgot-password',
  imports: [CommonModule, FormsModule],
  templateUrl: './forgot-password.html',
  styleUrl: './forgot-password.css',
})
export class ForgotPassword {
  email = '';
  code = '';
  newPassword = '';
  confirmPassword = '';

  showPassword = false;
  showConfirmPassword = false;

  errorMessage = signal('');
  infoMessage = signal('');
  loading = signal(false);
  awaitingCode = signal(false);
  showSuccessModal = signal(false);

  private pendingEmail = '';

  constructor(private authService: AuthService, private router: Router) {}

  togglePasswordVisibility() {
    this.showPassword = !this.showPassword;
  }

  toggleConfirmPasswordVisibility() {
    this.showConfirmPassword = !this.showConfirmPassword;
  }

  onRequest() {
    if (!this.email) {
      this.errorMessage.set('Please enter your email');
      return;
    }

    this.loading.set(true);
    this.errorMessage.set('');

    this.authService.requestPasswordReset(this.email).subscribe({
      next: (response) => {
        this.loading.set(false);
        this.pendingEmail = this.email;
        this.awaitingCode.set(true);
        this.infoMessage.set(response?.message || 'If an account exists for that email, a reset code has been sent.');
      },
      error: (error) => {
        this.errorMessage.set(error.error?.message || 'Could not send the reset code');
        this.loading.set(false);
      },
    });
  }

  onReset() {
    const code = this.code.trim();
    if (!code || !this.newPassword || !this.confirmPassword) {
      this.errorMessage.set('Please fill in all fields');
      return;
    }
    if (this.newPassword !== this.confirmPassword) {
      this.errorMessage.set('Passwords do not match');
      return;
    }
    if (this.newPassword.length < 6) {
      this.errorMessage.set('Password must be at least 6 characters long');
      return;
    }

    this.loading.set(true);
    this.errorMessage.set('');

    this.authService.resetPassword(this.pendingEmail, code, this.newPassword).subscribe({
      next: () => {
        this.loading.set(false);
        this.showSuccessModal.set(true);
      },
      error: (error) => {
        this.errorMessage.set(error.error?.message || 'Password reset failed');
        this.loading.set(false);
      },
    });
  }

  onResend() {
    this.errorMessage.set('');
    this.infoMessage.set('');
    this.authService.requestPasswordReset(this.pendingEmail).subscribe({
      next: (response) => {
        this.infoMessage.set(response?.message || 'A new reset code has been sent.');
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
