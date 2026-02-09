import { Component, OnInit, Inject, PLATFORM_ID } from '@angular/core';
import { CommonModule, isPlatformBrowser } from '@angular/common';
import { Api } from '../../services/api';

@Component({
  selector: 'app-cart',
  imports: [CommonModule],
  templateUrl: './cart.html',
  styleUrl: './cart.css',
})
export class Cart implements OnInit {
  cartItems: any[] = [];
  loading = true;

  constructor(private api: Api, @Inject(PLATFORM_ID) private platformId: Object) {}

  ngOnInit() {
    this.loadCart();
  }

  loadCart() {
    if (!isPlatformBrowser(this.platformId)) return;
    
    this.loading = true;
    const userId = +(localStorage.getItem('userId') || '1');
    this.api.getCart(userId).subscribe(items => {
      this.cartItems = items;
      this.loading = false;
    });
  }

  removeItem(itemId: number) {
    if (!isPlatformBrowser(this.platformId)) return;
    
    this.api.removeFromCart(itemId).subscribe(() => {
      this.loadCart();
    });
  }

  checkout() {
    if (!isPlatformBrowser(this.platformId)) return;
    
    const userId = +(localStorage.getItem('userId') || '1');
    this.api.checkout(userId).subscribe(() => {
      alert('Checkout complete');
      this.loadCart();
    });
  }

  get totalAmount() {
    return this.cartItems.reduce((total, item) => total + (item.product?.price || 0) * (item.quantity || 1), 0);
  }
}
