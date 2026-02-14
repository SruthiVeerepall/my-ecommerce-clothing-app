import { Component, OnInit, ChangeDetectorRef, Inject, PLATFORM_ID } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { CommonModule, isPlatformBrowser } from '@angular/common';
import { Api } from '../../services/api';
import { CartService } from '../../services/cart.service';

@Component({
  selector: 'app-product-detail',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './product-detail.html',
  styleUrl: './product-detail.css',
})
export class ProductDetail implements OnInit {
  product: any;
  loading = true;
  successMessage = '';

  constructor(private route: ActivatedRoute, private api: Api, private cartService: CartService, private cdr: ChangeDetectorRef, @Inject(PLATFORM_ID) private platformId: Object) {}

  ngOnInit() {
    const id = +this.route.snapshot.paramMap.get('id')!;
    this.api.getProduct(id).subscribe(data => {
      this.product = data;
      this.loading = false;
      this.cdr.detectChanges();
    });
  }

  addToCart() {
    if (!isPlatformBrowser(this.platformId)) return;
    
    const userId = +(localStorage.getItem('userId') || '1');
    this.api.addToCart({ userId, productId: this.product.id, quantity: 1 }).subscribe({
      next: (response) => {
        const itemName = response.product?.name || this.product.name;
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
