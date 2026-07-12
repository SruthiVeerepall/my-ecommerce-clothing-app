import { Component, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { AuthService } from '../../services/auth.service';
import { CartService } from '../../services/cart.service';

@Component({
  selector: 'app-login',
  imports: [CommonModule, FormsModule],
  templateUrl: './login.html',
  styleUrl: './login.css',
})
export class Login {
  credentials = {
    email: '',
    password: '',
  };
  errorMessage = signal('');
  loading = signal(false);
  showPassword = false;

  togglePasswordVisibility() {
    this.showPassword = !this.showPassword;
  }

  constructor(
    private authService: AuthService,
    private router: Router,
    private cartService: CartService
  ) {}

  onSubmit() {
    if (!this.credentials.email || !this.credentials.password) {
      this.errorMessage.set('Please fill in all fields');
      return;
    }

    this.loading.set(true);
    this.errorMessage.set('');

    this.authService.login(this.credentials).subscribe({
      next: () => {
        // Reload cart for the newly logged-in user
        this.cartService.loadCartCount();
        this.router.navigate(['/']);
      },
      error: (error) => {
        const body = error.error;
        if (body?.message) {
          this.errorMessage.set(body.message);
        } else if (typeof body === 'string' && body) {
          this.errorMessage.set(body);
        } else if (error.status === 401 || error.status === 400) {
          this.errorMessage.set('Incorrect email or password');
        } else {
          this.errorMessage.set('Login failed. Please try again.');
        }
        this.loading.set(false);
      },
    });
  }

  navigateToRegister() {
    this.router.navigate(['/register']);
  }

  navigateToForgotPassword() {
    this.router.navigate(['/forgot-password']);
  }
}
