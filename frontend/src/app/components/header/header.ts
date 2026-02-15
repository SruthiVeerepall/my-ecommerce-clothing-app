import { Component, OnInit, Inject, PLATFORM_ID, ChangeDetectorRef } from '@angular/core';
import { Router } from '@angular/router';
import { AuthService } from '../../services/auth.service';
import { CartService } from '../../services/cart.service';
import { CommonModule, isPlatformBrowser } from '@angular/common';

@Component({
  selector: 'app-header',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './header.html',
  styleUrl: './header.css',
})
export class Header implements OnInit {
  isAuthenticated = false;
  isAdmin = false;
  cartCount = 0;

  constructor(
    private authService: AuthService,
    private cartService: CartService,
    public router: Router,
    @Inject(PLATFORM_ID) private platformId: Object,
    private cdr: ChangeDetectorRef
  ) {}

  ngOnInit() {
    // Check initial admin status
    if (isPlatformBrowser(this.platformId)) {
      this.isAdmin = this.authService.isAdmin();
      console.log('Header ngOnInit - isAdmin:', this.isAdmin); // Debug log
    }

    // Subscribe to authentication changes
    this.authService.isAuthenticated$.subscribe(isAuth => {
      this.isAuthenticated = isAuth;
      // Update admin status whenever authentication changes
      if (isPlatformBrowser(this.platformId)) {
        this.isAdmin = this.authService.isAdmin();
        console.log('Header subscribe - isAuth:', isAuth, 'isAdmin:', this.isAdmin, 'role:', localStorage.getItem('role')); // Debug log
        this.cdr.detectChanges(); // Force change detection
      }
    });

    // Subscribe to cart count changes
    this.cartService.cartCount$.subscribe(count => {
      this.cartCount = count;
      // Schedule change detection rather than running immediately
      this.cdr.markForCheck();
    });
  }

  logout() {
    this.authService.logout();
    this.cartService.clearCart();
    this.isAdmin = false;
    this.router.navigate(['/login']);
  }

  navigateToLogin() {
    this.router.navigate(['/login']);
  }

  navigateToAdmin() {
    this.router.navigate(['/admin']);
  }
  navigateToCart() {
    // Assuming cart route exists
    this.router.navigate(['/cart']);
  }
}