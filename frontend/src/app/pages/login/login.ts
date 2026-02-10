import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { AuthService } from '../../services/auth.service';

@Component({
  selector: 'app-login',
  imports: [CommonModule, FormsModule],
  templateUrl: './login.html',
  styleUrl: './login.css',
})
export class Login {
  credentials = {
    username: '',
    password: '',
  };
  errorMessage = '';
  loading = false;

  constructor(private authService: AuthService, private router: Router) {}

  onSubmit() {
    if (!this.credentials.username || !this.credentials.password) {
      this.errorMessage = 'Please fill in all fields';
      return;
    }

    this.loading = true;
    this.errorMessage = '';

    this.authService.login(this.credentials).subscribe({
      next: (response) => {
        console.log('Login response:', response); // Debug log
        console.log('Role stored:', localStorage.getItem('role')); // Debug log
        this.router.navigate(['/']);
      },
      error: (error) => {
        this.errorMessage = error.error?.message || 'Login failed';
        this.loading = false;
      },
    });
  }

  navigateToRegister() {
    this.router.navigate(['/register']);
  }
}