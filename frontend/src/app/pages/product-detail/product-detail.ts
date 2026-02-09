import { Component, OnInit, ChangeDetectorRef, Inject, PLATFORM_ID } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { CommonModule, isPlatformBrowser } from '@angular/common';
import { Api } from '../../services/api';

@Component({
  selector: 'app-product-detail',
  imports: [CommonModule],
  templateUrl: './product-detail.html',
  styleUrl: './product-detail.css',
})
export class ProductDetail implements OnInit {
  product: any;
  loading = true;

  constructor(private route: ActivatedRoute, private api: Api, private cdr: ChangeDetectorRef, @Inject(PLATFORM_ID) private platformId: Object) {}

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
    this.api.addToCart({ userId, productId: this.product.id, quantity: 1 }).subscribe(() => {
      alert('Added to cart');
    });
  }
}
