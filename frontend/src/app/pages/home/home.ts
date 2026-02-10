import { Component, OnInit, ChangeDetectorRef, NgZone } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Api } from '../../services/api';

@Component({
  selector: 'app-home',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './home.html',
  styleUrl: './home.css',
})
export class Home implements OnInit {
  products: any[] = [];
  loading = false;
  successMessage = '';

  constructor(
    private api: Api, 
    private cdr: ChangeDetectorRef,
    private zone: NgZone
  ) {}

  ngOnInit() {
    // Small delay on refresh to let the browser stabilize
    setTimeout(() => {
      this.loadProducts();
    }, 50);
  }

  loadProducts() {
    if (this.loading && this.products.length > 0) return; // Prevent double trigger
    
    this.loading = true;
    console.log('Home: Loading collection...');
    
    this.api.getProducts().subscribe({
      next: (data) => {
        // Run inside Angular Zone to ensure UI updates on refresh
        this.zone.run(() => {
          console.log('Home: Success! Received products:', data.length);
          this.products = data;
          this.loading = false;
          
          // Force a UI refresh cycle
          this.cdr.markForCheck();
          this.cdr.detectChanges();
        });
      },
      error: (err) => {
        this.zone.run(() => {
          console.error('Home: CRITICAL ERROR fetching products:', err);
          this.loading = false;
          this.cdr.detectChanges();
        });
      }
    });
  }

  // To improve performance in *ngFor
  trackByProductId(index: number, product: any) {
    return product.id;
  }

  addToCart(product: any) {
    const userId = Number(localStorage.getItem('userId') || '1');
    const cartItem = {
      userId: userId,
      productId: product.id,
      quantity: 1
    };

    this.api.addToCart(cartItem).subscribe({
      next: () => {
        this.successMessage = `✅ ${product.name} added to cart!`;
        setTimeout(() => this.successMessage = '', 5000);
      },
      error: (err) => {
        console.error('Error adding to cart:', err);
        alert('Failed to add to cart. Please log in first.');
      }
    });
  }
}
