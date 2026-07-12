import { Component, OnInit, ViewChild, ElementRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, NgForm } from '@angular/forms';
import { Api } from '../../services/api';
import { Router } from '@angular/router';
import { finalize } from 'rxjs';

interface Product {
  id?: number;
  name: string;
  description: string;
  price: number;
  category: string;
  imageUrl: string;
  imageUrls: string[];
  sizes: string[];
}

@Component({
  selector: 'app-admin',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './admin.html',
  styleUrl: './admin.css',
})
export class Admin implements OnInit {
  @ViewChild('fileInput') fileInput!: ElementRef;
  @ViewChild('productForm') productForm!: NgForm;

  product: Product = {
    name: '',
    description: '',
    price: 0,
    category: 'Dresses',
    imageUrl: '',
    imageUrls: [],
    sizes: []
  };

  availableSizes: string[] = ['XS', 'S', 'M', 'L', 'XL', 'XXL', 'Free Size'];

  products: Product[] = [];
  loading = false;
  loadingProducts = false;
  successMessage = '';
  errorMessage = '';
  imagePreview = '';
  selectedImageIndex = 0;
  editMode = false;
  editingProductId?: number;

  constructor(private api: Api, private router: Router) {}

  ngOnInit() {
    this.loadProducts();
  }

  private normalizeProductImages(product: Product): Product {
    const imageUrls = Array.isArray((product as any).imageUrls)
      ? (product as any).imageUrls.filter((image: string | null | undefined) => !!image)
      : [];

    return {
      ...product,
      imageUrls: imageUrls.length > 0 ? imageUrls : (product.imageUrl ? [product.imageUrl] : []),
      imageUrl: product.imageUrl || (imageUrls[0] || '')
    };
  }

  getProductImages(product: Product): string[] {
    return this.normalizeProductImages(product).imageUrls;
  }

  loadProducts() {
    this.loadingProducts = true;
    this.api.getProducts().subscribe({
      next: (data) => {
        this.products = data.map((item: any) => this.normalizeProductImages(item));
        this.loadingProducts = false;
        setTimeout(() => {
          const productsSection = document.querySelector('.products-section');
          if (productsSection) {
            productsSection.scrollIntoView({ behavior: 'smooth', block: 'start' });
          }
        }, 300);
      },
      error: (err) => {
        console.error('Error loading products:', err);
        this.loadingProducts = false;
        this.errorMessage = 'Failed to load products. Retrying...';
        setTimeout(() => this.loadProducts(), 2000);
      }
    });
  }

  onImageUrlChange() {
    this.product.imageUrls = this.product.imageUrl ? [this.product.imageUrl] : [];
    this.imagePreview = this.product.imageUrl;
    this.selectedImageIndex = 0;
  }

  isSizeSelected(size: string): boolean {
    return this.product.sizes.includes(size);
  }

  toggleSize(size: string) {
    if (this.isSizeSelected(size)) {
      this.product.sizes = this.product.sizes.filter((s) => s !== size);
    } else {
      this.product.sizes = [...this.product.sizes, size];
    }
  }

  onFileSelected(event: any) {
    const selectedFiles = Array.from(event.target.files || []) as File[];
    const files = selectedFiles.filter((file): file is File => file instanceof File);

    if (!files.length) {
      return;
    }

    const invalidFiles = files.filter((file) => !file.type.startsWith('image/'));
    if (invalidFiles.length) {
      this.errorMessage = 'Please select valid image files';
      return;
    }

    const oversizedFiles = files.filter((file) => file.size > 5 * 1024 * 1024);
    if (oversizedFiles.length) {
      this.errorMessage = 'Each image should be less than 5MB';
      return;
    }

    this.errorMessage = '';
    files.forEach((file) => this.compressImage(file));
  }

  compressImage(file: File) {
    const reader = new FileReader();
    reader.onload = (e: any) => {
      const img = new Image();
      img.onload = () => {
        const canvas = document.createElement('canvas');
        const ctx = canvas.getContext('2d')!;

        let width = img.width;
        let height = img.height;
        const maxSize = 800;

        if (width > height && width > maxSize) {
          height = (height * maxSize) / width;
          width = maxSize;
        } else if (height > maxSize) {
          width = (width * maxSize) / height;
          height = maxSize;
        }

        canvas.width = width;
        canvas.height = height;
        ctx.drawImage(img, 0, 0, width, height);

        const compressedBase64 = canvas.toDataURL('image/jpeg', 0.7);
        this.product.imageUrls = [...this.product.imageUrls, compressedBase64];
        this.product.imageUrl = compressedBase64;
        this.imagePreview = compressedBase64;
        this.selectedImageIndex = this.product.imageUrls.length - 1;
        this.errorMessage = '';
      };
      img.src = e.target.result;
    };
    reader.onerror = () => {
      this.errorMessage = 'Failed to read image file';
    };
    reader.readAsDataURL(file);
  }

  selectImage(index: number) {
    this.selectedImageIndex = index;
    this.imagePreview = this.product.imageUrls[index] || '';
    this.product.imageUrl = this.imagePreview;
  }

  removeImage(index?: number) {
    if (typeof index === 'number') {
      this.product.imageUrls.splice(index, 1);
      if (this.product.imageUrls.length === 0) {
        this.product.imageUrl = '';
        this.imagePreview = '';
        this.selectedImageIndex = 0;
      } else {
        const nextIndex = Math.min(index, this.product.imageUrls.length - 1);
        this.selectedImageIndex = nextIndex;
        this.imagePreview = this.product.imageUrls[nextIndex];
        this.product.imageUrl = this.imagePreview;
      }
      return;
    }

    this.product.imageUrls = [];
    this.product.imageUrl = '';
    this.imagePreview = '';
    this.selectedImageIndex = 0;
  }

  onSubmit() {
    this.loading = true;
    this.successMessage = '';
    this.errorMessage = '';

    const productData = {
      ...this.product,
      imageUrl: this.product.imageUrls[0] || this.product.imageUrl,
      imageUrls: this.product.imageUrls.length > 0 ? this.product.imageUrls : (this.product.imageUrl ? [this.product.imageUrl] : [])
    };

    if (this.editMode && this.editingProductId) {
      this.api.updateProduct(this.editingProductId, productData)
        .pipe(finalize(() => {
          this.loading = false;
        }))
        .subscribe({
          next: () => {
            this.successMessage = '✅ Product updated successfully!';
            this.resetForm();
            this.loadProducts();
            setTimeout(() => this.successMessage = '', 5000);
          },
          error: (err) => {
            this.errorMessage = 'Failed to update product. Please try again.';
            console.error(err);
          }
        });
    } else {
      this.api.createProduct(productData)
        .pipe(finalize(() => {
          this.loading = false;
        }))
        .subscribe({
          next: () => {
            this.successMessage = '✅ Product added successfully!';
            this.resetForm();
            this.loadProducts();
            setTimeout(() => this.successMessage = '', 5000);
          },
          error: (err) => {
            console.error('❌ Create error:', err);
            this.errorMessage = err.error?.message || 'Failed to add product. Please try again.';
          }
        });
    }
  }

  editProduct(product: Product) {
    this.editMode = true;
    this.editingProductId = product.id;
    this.product = {
      ...this.normalizeProductImages(product),
      sizes: [...(product.sizes || [])]
    };
    this.imagePreview = this.product.imageUrls[0] || this.product.imageUrl;
    this.selectedImageIndex = 0;
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }

  deleteProduct(id: number) {
    if (confirm('Are you sure you want to delete this product?')) {
      this.api.deleteProduct(id).subscribe({
        next: () => {
          this.successMessage = '🗑️ Product deleted successfully!';
          this.loadProducts();
          setTimeout(() => this.successMessage = '', 5000);
        },
        error: (err) => {
          this.errorMessage = 'Failed to delete product.';
          console.error(err);
        }
      });
    }
  }

  resetForm() {
    if (this.productForm) {
      this.productForm.resetForm({
        category: 'Dresses'
      });
    }

    this.product = {
      name: '',
      description: '',
      price: 0,
      category: 'Dresses',
      imageUrl: '',
      imageUrls: [],
      sizes: []
    };
    this.imagePreview = '';
    this.selectedImageIndex = 0;
    this.editMode = false;
    this.editingProductId = undefined;

    if (this.fileInput && this.fileInput.nativeElement) {
      this.fileInput.nativeElement.value = '';
    }
  }

  goBack() {
    this.router.navigate(['/']);
  }
}