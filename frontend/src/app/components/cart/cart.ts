import { Component, OnInit, Inject, PLATFORM_ID, ChangeDetectorRef, NgZone } from '@angular/core';
import { CommonModule, isPlatformBrowser } from '@angular/common';
import { Api } from '../../services/api';
import { CartService } from '../../services/cart.service';
import { Router } from '@angular/router';

@Component({
  selector: 'app-cart',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './cart.html',
  styleUrl: './cart.css',
})
export class Cart implements OnInit {
  cartItems: any[] = [];
  loading = false; // Start with false to avoid initial blocking if possible
  successMessage = '';

  constructor(
    private api: Api,
    private cartService: CartService,
    @Inject(PLATFORM_ID) private platformId: Object,
    private router: Router,
    private cdr: ChangeDetectorRef,
    private zone: NgZone
  ) {}

  ngOnInit() {
    this.loadCart();
  }

  loadCart() {
    if (!isPlatformBrowser(this.platformId)) return;
    
    this.loading = true;
    const userId = +(localStorage.getItem('userId') || '1');
    console.log('Loading cart for userId:', userId);
    
    this.api.getCart(userId).subscribe({
      next: (items) => {
        console.log('Cart items received:', items);
        
        // Update component state
        this.cartItems = items;
        this.loading = false;
        
        // Use markForCheck instead of detectChanges to schedule check
        this.cdr.markForCheck();
        
        // Update cart count after a delay to prevent conflicts
        setTimeout(() => {
          this.cartService.updateCountFromItems(items);
        }, 0);
      },
      error: (err) => {
        console.error('Error loading cart:', err);
        this.loading = false;
        this.successMessage = '❌ Failed to load cart. Please make sure the backend server is running.';
        this.cdr.markForCheck();
        
        setTimeout(() => {
          this.successMessage = '';
          this.cdr.markForCheck();
        }, 5000);
      }
    });
  }

  removeItem(itemId: number) {
    if (!isPlatformBrowser(this.platformId)) return;
    
    this.api.removeFromCart(itemId).subscribe(() => {
      this.successMessage = '✅ Product removed from cart successfully!';
      this.cdr.markForCheck();
      
      setTimeout(() => {
        this.successMessage = '';
        this.cdr.markForCheck();
      }, 3000);
      
      // Load cart with a slight delay
      setTimeout(() => this.loadCart(), 100);
    });
  }

  updateQuantity(item: any, change: number) {
    if (!isPlatformBrowser(this.platformId)) return;
    
    const newQuantity = item.quantity + change;
    if (newQuantity < 1) return; // Don't allow quantity less than 1
    
    this.api.updateCartItemQuantity(item.id, newQuantity).subscribe({
      next: () => {
        // Load cart with a slight delay
        setTimeout(() => this.loadCart(), 100);
      },
      error: (err) => {
        console.error('Error updating quantity:', err);
      }
    });
  }

  checkout() {
    this.router.navigate(['/checkout']);
  }

  get totalAmount() {
    return this.cartItems.reduce((total, item) => total + (item.product?.price || 0) * (item.quantity || 1), 0);
  }

  goBack() {
    this.router.navigate(['/']);
  }
}
