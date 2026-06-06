import { Component, OnInit } from '@angular/core';
import { RouterOutlet, NavigationEnd } from '@angular/router';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { filter } from 'rxjs/operators';
import { AuthService } from './services/auth.service';
import { Header } from './components/header/header';
import { Footer } from './components/footer/footer';

@Component({
  selector: 'app-root',
  imports: [RouterOutlet, CommonModule, Header, Footer],
  templateUrl: './app.html',
  styleUrl: './app.css'
})
export class App implements OnInit {
  protected readonly title = 'eCommerce Clothing Store';
  hideChrome = false;

  private readonly authRoutes = ['/login', '/register'];

  constructor(private authService: AuthService, private router: Router) {}

  ngOnInit() {
    this.authService.isAuthenticated$.subscribe(isAuth => {
      // Optional: handle global auth state if needed
    });

    this.hideChrome = this.isAuthRoute(this.router.url);
    this.router.events
      .pipe(filter((event): event is NavigationEnd => event instanceof NavigationEnd))
      .subscribe(event => {
        this.hideChrome = this.isAuthRoute(event.urlAfterRedirects);
      });
  }

  private isAuthRoute(url: string): boolean {
    const path = url.split('?')[0].split('#')[0];
    return this.authRoutes.includes(path);
  }
}
