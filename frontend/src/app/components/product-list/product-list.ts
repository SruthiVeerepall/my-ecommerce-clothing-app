import { Component, OnInit, ChangeDetectorRef, Inject, PLATFORM_ID } from '@angular/core';
import { CommonModule, isPlatformBrowser } from '@angular/common';
import { Api } from '../../services/api';
import { ProductCard } from '../product-card/product-card';

@Component({
  selector: 'app-product-list',
  imports: [CommonModule, ProductCard],
  templateUrl: './product-list.html',
  styleUrl: './product-list.css',
})
export class ProductList implements OnInit {
  products: any[] = [];

  constructor(private api: Api, private cdr: ChangeDetectorRef, @Inject(PLATFORM_ID) private platformId: Object) {}

  ngOnInit() {
    this.api.getProducts().subscribe(data => {
      this.products = data;
      this.cdr.detectChanges();
    });
  }

  onAddToCart(product: any) {
    if (!isPlatformBrowser(this.platformId)) return;
    
    const userId = localStorage.getItem('userId') || '1';
    this.api.addToCart({ userId: +userId, productId: product.id, quantity: 1 }).subscribe(() => {
      alert('Added to cart');
    });
  }
}
