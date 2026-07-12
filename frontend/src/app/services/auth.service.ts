import { Injectable, Inject, PLATFORM_ID } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { BehaviorSubject, Observable, tap } from 'rxjs';
import { isPlatformBrowser } from '@angular/common';
import { Router } from '@angular/router';

@Injectable({
  providedIn: 'root',
})
export class AuthService {
  private isAuthenticatedSubject = new BehaviorSubject<boolean>(false);
  public isAuthenticated$ = this.isAuthenticatedSubject.asObservable();
  private inactivityTimer: number | null = null;
  private readonly inactivityTimeoutMs = 20 * 60 * 1000;
  private readonly activityEvents = ['mousemove', 'keydown', 'scroll', 'click', 'touchstart', 'touchmove', 'pointerdown'];
  private readonly handleActivity = () => {
    this.resetInactivityTimer();
  };

  constructor(
    private http: HttpClient,
    @Inject(PLATFORM_ID) private platformId: Object,
    private router: Router
  ) {
    if (isPlatformBrowser(this.platformId)) {
      const token = localStorage.getItem('token');
      this.isAuthenticatedSubject.next(!!token);
      if (token) {
        this.startInactivityTimer();
      }
    }
  }

  // Step 1: start registration — backend emails a verification code, no account created yet.
  register(user: { username: string; email: string; password: string }): Observable<any> {
    return this.http.post('http://localhost:8080/api/auth/register', user);
  }

  // Step 2: submit the emailed code — backend validates it and creates the account.
  verifyEmail(email: string, code: string): Observable<any> {
    return this.http.post('http://localhost:8080/api/auth/verify-email', { email, code });
  }

  // Re-send a fresh verification code for a pending signup.
  resendCode(email: string): Observable<any> {
    return this.http.post('http://localhost:8080/api/auth/resend-code', { email });
  }

  // Forgot password: request a reset code by email.
  requestPasswordReset(email: string): Observable<any> {
    return this.http.post('http://localhost:8080/api/auth/forgot-password', { email });
  }

  // Forgot password: submit the code + new password to reset.
  resetPassword(email: string, code: string, password: string): Observable<any> {
    return this.http.post('http://localhost:8080/api/auth/reset-password', { email, code, password });
  }

  login(credentials: { email: string; password: string }): Observable<any> {
    return this.http.post('http://localhost:8080/api/auth/login', credentials).pipe(
      tap((response: any) => {
        if (isPlatformBrowser(this.platformId)) {
          localStorage.setItem('token', response.jwt);
          localStorage.setItem('role', response.role || 'USER');
          localStorage.setItem('userId', response.userId ? response.userId.toString() : '1');
          this.isAuthenticatedSubject.next(true);
          this.startInactivityTimer();
        }
      })
    );
  }

  logout(): void {
    if (isPlatformBrowser(this.platformId)) {
      this.clearInactivityTimer();
      localStorage.removeItem('token');
      localStorage.removeItem('userId');
      localStorage.removeItem('role');
      this.isAuthenticatedSubject.next(false);
    }
  }

  private startInactivityTimer(): void {
    if (!isPlatformBrowser(this.platformId)) {
      return;
    }

    this.clearInactivityTimer();

    this.activityEvents.forEach((event) => {
      document.addEventListener(event, this.handleActivity, true);
    });

    this.resetInactivityTimer();
  }

  private resetInactivityTimer(): void {
    if (!isPlatformBrowser(this.platformId) || !this.isAuthenticatedSubject.value) {
      return;
    }

    if (this.inactivityTimer) {
      clearTimeout(this.inactivityTimer);
    }

    this.inactivityTimer = window.setTimeout(() => {
      this.expireSession();
    }, this.inactivityTimeoutMs);
  }

  private clearInactivityTimer(): void {
    if (this.inactivityTimer) {
      clearTimeout(this.inactivityTimer);
      this.inactivityTimer = null;
    }

    this.activityEvents.forEach((event) => {
      document.removeEventListener(event, this.handleActivity, true);
    });
  }

  private expireSession(): void {
    this.logout();
    if (this.router.url !== '/login') {
      this.router.navigate(['/login']);
    }
  }

  isAuthenticated(): boolean {
    return this.isAuthenticatedSubject.value;
  }

  isAdmin(): boolean {
    if (isPlatformBrowser(this.platformId)) {
      return localStorage.getItem('role') === 'ADMIN';
    }
    return false;
  }
}