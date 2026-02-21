import { Component, OnInit, OnDestroy, ChangeDetectorRef, NgZone } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { Api } from '../../services/api';
import { CartService } from '../../services/cart.service';

@Component({
  selector: 'app-home',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './home.html',
  styleUrl: './home.css',
})
export class Home implements OnInit, OnDestroy {
  products: any[] = [];
  featuredProducts: any[] = [];
  loading = false;
  successMessage = '';
  heroProduct: any = null;
  currentHeroIndex = 0;
  carouselInterval: any;
  
  categories = [
    { name: 'Sarees', icon: '🥻', image: '', count: 0 },
    { name: 'Lehengas', icon: '👗', image: '', count: 0 },
    { name: 'Kurties', icon: '👘', image: '', count: 0 },
    { name: 'Kids', icon: '👶', image: '', count: 0 }
  ];
  
  testimonials = [
    {
      name: 'Priya Sharma',
      image: '',
      rating: 5,
      text: 'Amazing collection! The saree I bought for my wedding was absolutely stunning. Quality is top-notch!'
    },
    {
      name: 'Anita Reddy',
      image: '',
      rating: 5,
      text: 'VR Boutique has the most beautiful ethnic wear. Their customer service is excellent and delivery was fast.'
    },
    {
      name: 'Meera Patel',
      image: '',
      rating: 5,
      text: 'Love their lehenga collection! Perfect for festivals and special occasions. Highly recommended!'
    }
  ];

  constructor(
    private api: Api,
    private cartService: CartService,
    private cdr: ChangeDetectorRef,
    private zone: NgZone,
    public router: Router
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
          this.featuredProducts = data.slice(0, 4); // Only show 4 featured products as preview
          this.updateCategoryCounts(data);
          this.loading = false;
          this.startCarousel();
          
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
  
  updateCategoryCounts(products: any[]) {
    this.categories.forEach(cat => {
      cat.count = products.filter(p => p.category === cat.name).length;
    });
  }
  
  navigateToCategory(categoryName: string) {
    this.router.navigate(['/shop'], { queryParams: { category: categoryName } });
  }
  
  navigateToShop() {
    this.router.navigate(['/shop']);
  }
  
  viewProduct(productId: number) {
    this.router.navigate(['/product', productId]);
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
      quantity: 1,
      selectedSize: product.sizes && product.sizes.length > 0 ? product.sizes[0] : 'Free Size',
      selectedColor: product.colors && product.colors.length > 0 ? product.colors[0] : 'Default'
    };

    this.api.addToCart(cartItem).subscribe({
      next: (response) => {
        console.log('Add to cart response:', response);
        // Use the response which now includes product details
        const itemName = response.product?.name || product.name;
        
        // Show success message immediately in Angular zone
        this.zone.run(() => {
          this.successMessage = `✅ "${itemName}" added to cart! Click product for size/color options.`;
          console.log('Success message set:', this.successMessage);
          
          // Force immediate change detection
          this.cdr.detectChanges();
          
          // Verify the message is displaying
          console.log('successMessage should now be visible in UI');
        });
        
        // Clear message after 4 seconds
        setTimeout(() => {
          this.zone.run(() => {
            this.successMessage = '';
            this.cdr.detectChanges();
            console.log('Success message cleared');
          });
        }, 4000);
        
        // Update cart count after a delay to prevent change detection conflicts
        setTimeout(() => {
          const quantity = cartItem.quantity || 1;
          this.cartService.incrementCartCount(quantity);
        }, 0);
      },
      error: (err) => {
        console.error('Error adding to cart:', err);
        alert('Failed to add to cart. Please log in first.');
      }
    });
  }

  startCarousel() {
    if (this.carouselInterval) {
      clearInterval(this.carouselInterval);
    }

    if (this.products.length === 0) {
      this.heroProduct = null;
      return;
    }

    this.currentHeroIndex = 0;
    const firstProduct = this.products[0];
    this.heroProduct = firstProduct ? { ...firstProduct } : null;
    this.cdr.markForCheck();

    this.carouselInterval = setInterval(() => {
      this.zone.run(() => {
        if (this.products.length === 0) {
          return;
        }

        this.currentHeroIndex = (this.currentHeroIndex + 1) % this.products.length;
        const nextProduct = this.products[this.currentHeroIndex];
        this.heroProduct = nextProduct ? { ...nextProduct } : null;
        this.cdr.markForCheck();
      });
    }, 3000);
  }

  onImageLoad() {
    console.log('Hero image loaded successfully');
  }

  onImageError(url: string) {
    console.warn('Hero image failed to load', url);
  }

  ngOnDestroy() {
    if (this.carouselInterval) {
      clearInterval(this.carouselInterval);
    }
  }

}
