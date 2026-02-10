import { Injectable, Inject, PLATFORM_ID } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { BehaviorSubject, Observable, tap } from 'rxjs';
import { isPlatformBrowser } from '@angular/common';

@Injectable({
  providedIn: 'root',
})
export class AuthService {
  private isAuthenticatedSubject = new BehaviorSubject<boolean>(false);
  public isAuthenticated$ = this.isAuthenticatedSubject.asObservable();

  constructor(
    private http: HttpClient,
    @Inject(PLATFORM_ID) private platformId: Object
  ) {
    if (isPlatformBrowser(this.platformId)) {
      const token = localStorage.getItem('token');
      this.isAuthenticatedSubject.next(!!token);
    }
  }

  register(user: { username: string; email: string; password: string }): Observable<any> {
    return this.http.post('http://localhost:8080/api/auth/register', user).pipe(
      tap(response => {
        if (isPlatformBrowser(this.platformId)) {
          // For now, after registration, redirect to login
          // In a real app, you might want to auto-login after registration
        }
      })
    );
  }

  login(credentials: { username: string; password: string }): Observable<any> {
    return this.http.post('http://localhost:8080/api/auth/login', credentials).pipe(
      tap((response: any) => {
        if (isPlatformBrowser(this.platformId)) {
          localStorage.setItem('token', response.jwt);
          localStorage.setItem('role', response.role || 'USER');
          // Extract user ID from token or make a separate call
          // For now, we'll use a default user ID
          localStorage.setItem('userId', '1');
          this.isAuthenticatedSubject.next(true);
        }
      })
    );
  }

  logout(): void {
    if (isPlatformBrowser(this.platformId)) {
      localStorage.removeItem('token');
      localStorage.removeItem('userId');
      localStorage.removeItem('role');
      this.isAuthenticatedSubject.next(false);
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