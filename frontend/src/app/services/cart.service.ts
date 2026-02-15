import { Injectable, Inject, PLATFORM_ID } from '@angular/core';
import { BehaviorSubject } from 'rxjs';
import { isPlatformBrowser } from '@angular/common';
import { Api } from './api';

@Injectable({
  providedIn: 'root',
})
export class CartService {
  private cartCountSubject = new BehaviorSubject<number>(0);
  public cartCount$ = this.cartCountSubject.asObservable();

  constructor(
    private api: Api,
    @Inject(PLATFORM_ID) private platformId: Object
  ) {
    this.loadCartCount();
  }

  loadCartCount() {
    if (!isPlatformBrowser(this.platformId)) return;
    
    const userId = Number(localStorage.getItem('userId') || '1');
    this.api.getCart(userId).subscribe({
      next: (items) => {
        this.updateCountFromItems(items);
      },
      error: (err) => {
        console.error('Error loading cart count:', err);
        this.cartCountSubject.next(0);
      }
    });
  }

  updateCountFromItems(items: any[]) {
    const totalCount = items.reduce((sum, item) => sum + (item.quantity || 0), 0);
    console.log('Updating cart count from items:', items.length, 'items, total quantity:', totalCount);
    this.cartCountSubject.next(totalCount);
  }

  updateCartCount(count: number) {
    this.cartCountSubject.next(count);
  }

  incrementCartCount(quantity: number = 1) {
    const currentCount = this.cartCountSubject.value;
    this.cartCountSubject.next(currentCount + quantity);
  }

  clearCart() {
    this.cartCountSubject.next(0);
  }
}
