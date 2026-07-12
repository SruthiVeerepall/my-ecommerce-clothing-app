import { Component, OnInit, ChangeDetectorRef, Inject, PLATFORM_ID } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { CommonModule, isPlatformBrowser } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Api } from '../../services/api';
import { CartService } from '../../services/cart.service';

@Component({
  selector: 'app-product-detail',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './product-detail.html',
  styleUrl: './product-detail.css',
})
export class ProductDetail implements OnInit {
  product: any;
  loading = true;
  successMessage = '';
  relatedProducts: any[] = [];

  selectedSize: string = '';
  selectedColor: string = '';
  quantity: number = 1;
  currentImageIndex = 0;
  touchStartX = 0;
  touchEndX = 0;

  availableSizes: string[] = [];
  availableColors: string[] = ['Red', 'Blue', 'Green', 'Yellow', 'Pink', 'Purple', 'Black', 'White', 'Gold', 'Silver'];

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private api: Api,
    private cartService: CartService,
    private cdr: ChangeDetectorRef,
    @Inject(PLATFORM_ID) private platformId: Object
  ) {}

  ngOnInit() {
    const id = +this.route.snapshot.paramMap.get('id')!;
    this.loadProduct(id);
  }

  getProductImages(product: any = this.product): string[] {
    const imageUrls = Array.isArray(product?.imageUrls)
      ? product.imageUrls.filter((image: string | null | undefined) => !!image)
      : [];

    if (imageUrls.length > 0) {
      return imageUrls;
    }

    return product?.imageUrl ? [product.imageUrl] : [];
  }

  loadProduct(id: number) {
    this.loading = true;
    this.api.getProduct(id).subscribe({
      next: (data) => {
        this.product = data;
        this.currentImageIndex = 0;

        if (this.product.sizes && this.product.sizes.length > 0) {
          this.availableSizes = this.product.sizes;
          this.selectedSize = this.product.sizes[0];
        } else {
          this.availableSizes = [];
          this.selectedSize = '';
        }

        if (this.product.colors && this.product.colors.length > 0) {
          this.availableColors = this.product.colors;
          this.selectedColor = this.product.colors[0];
        } else {
          this.selectedColor = 'Default';
        }

        this.loading = false;
        this.loadRelatedProducts();
        this.cdr.detectChanges();
      },
      error: (err) => {
        console.error('Error loading product:', err);
        this.loading = false;
        this.cdr.detectChanges();
      }
    });
  }

  loadRelatedProducts() {
    this.api.getProducts().subscribe({
      next: (products) => {
        this.relatedProducts = products
          .filter((p: any) => p.category === this.product.category && p.id !== this.product.id)
          .slice(0, 4);
        this.cdr.detectChanges();
      },
      error: (err) => {
        console.error('Error loading related products:', err);
      }
    });
  }

  nextImage() {
    const images = this.getProductImages();
    if (!images.length) {
      return;
    }
    this.currentImageIndex = (this.currentImageIndex + 1) % images.length;
  }

  prevImage() {
    const images = this.getProductImages();
    if (!images.length) {
      return;
    }
    this.currentImageIndex = (this.currentImageIndex - 1 + images.length) % images.length;
  }

  selectImage(index: number) {
    this.currentImageIndex = index;
  }

  onTouchStart(event: TouchEvent) {
    this.touchStartX = event.changedTouches[0].clientX;
  }

  onTouchEnd(event: TouchEvent) {
    this.touchEndX = event.changedTouches[0].clientX;
    const delta = this.touchStartX - this.touchEndX;
    if (delta > 50) {
      this.nextImage();
    } else if (delta < -50) {
      this.prevImage();
    }
  }

  incrementQuantity() {
    this.quantity++;
  }

  decrementQuantity() {
    if (this.quantity > 1) {
      this.quantity--;
    }
  }

  selectSize(size: string) {
    this.selectedSize = size;
  }

  selectColor(color: string) {
    this.selectedColor = color;
  }

  goBack() {
    this.router.navigate(['/shop']);
  }

  viewProduct(productId: number) {
    this.router.navigate(['/product', productId]).then(() => {
      this.loadProduct(productId);
      window.scrollTo(0, 0);
    });
  }

  addToCart() {
    if (!isPlatformBrowser(this.platformId)) return;

    const userId = +(localStorage.getItem('userId') || '1');
    const cartItem = {
      userId,
      productId: this.product.id,
      quantity: this.quantity,
      selectedSize: this.selectedSize,
      selectedColor: this.selectedColor
    };

    this.api.addToCart(cartItem).subscribe({
      next: (response) => {
        const itemName = response.product?.name || this.product.name;
        const options = [this.selectedSize, this.selectedColor]
          .filter((opt) => opt && opt !== 'Default')
          .join(', ');
        const optionText = options ? ` (${options})` : '';
        this.successMessage = `✅ ${this.quantity} x "${itemName}"${optionText} added to cart successfully!`;
        this.cartService.incrementCartCount(this.quantity);
        setTimeout(() => this.successMessage = '', 4000);
      },
      error: (err) => {
        console.error('Error adding to cart:', err);
        alert('Failed to add to cart. Please try again.');
      }
    });
  }
}
