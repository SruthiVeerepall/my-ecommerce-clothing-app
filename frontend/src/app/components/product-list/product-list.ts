import { Component, OnInit, ChangeDetectorRef, Inject, PLATFORM_ID } from '@angular/core';
import { CommonModule, isPlatformBrowser } from '@angular/common';
import { Api } from '../../services/api';
import { CartService } from '../../services/cart.service';
import { ProductCard } from '../product-card/product-card';

@Component({
  selector: 'app-product-list',
  standalone: true,
  imports: [CommonModule, ProductCard],
  templateUrl: './product-list.html',
  styleUrl: './product-list.css',
})
export class ProductList implements OnInit {
  products: any[] = [];
  successMessage = '';

  constructor(private api: Api, private cartService: CartService, private cdr: ChangeDetectorRef, @Inject(PLATFORM_ID) private platformId: Object) {}

  ngOnInit() {
    this.api.getProducts().subscribe(data => {
      this.products = data;
      this.cdr.detectChanges();
    });
  }

  onAddToCart(product: any) {
    if (!isPlatformBrowser(this.platformId)) return;
    
    const userId = localStorage.getItem('userId') || '1';
    this.api.addToCart({ userId: +userId, productId: product.id, quantity: 1 }).subscribe({
      next: (response) => {
        const itemName = response.product?.name || product.name;
        this.successMessage = `✅ Product "${itemName}" added to cart successfully!`;
        this.cartService.loadCartCount();
        setTimeout(() => this.successMessage = '', 4000);
      },
      error: (err) => {
        console.error('Error adding to cart:', err);
        alert('Failed to add to cart. Please try again.');
      }
    });
  }
}
