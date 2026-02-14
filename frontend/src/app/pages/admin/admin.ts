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
    imageUrl: ''
  };
  
  products: Product[] = [];
  loading = false;
  loadingProducts = false;
  successMessage = '';
  errorMessage = '';
  imagePreview = '';
  editMode = false;
  editingProductId?: number;

  constructor(private api: Api, private router: Router) {}

  ngOnInit() {
    this.loadProducts();
  }

  loadProducts() {
    this.loadingProducts = true;
    console.log('Loading products...');
    this.api.getProducts().subscribe({
      next: (data) => {
        console.log('Products loaded successfully:', data.length, 'products');
        this.products = data;
        this.loadingProducts = false;
        // Scroll to products section to show the new product
        setTimeout(() => {
          const productsSection = document.querySelector('.products-section');
          if (productsSection) {
            productsSection.scrollIntoView({ behavior: 'smooth', block: 'start' });
            console.log('Scrolled to products section');
          }
        }, 300);
      },
      error: (err) => {
        console.error('Error loading products:', err);
        this.loadingProducts = false;
        this.errorMessage = 'Failed to load products. Retrying...';
        // Retry loading products after 2 seconds
        setTimeout(() => this.loadProducts(), 2000);
      }
    });
  }

  onImageUrlChange() {
    this.imagePreview = this.product.imageUrl;
  }

  onFileSelected(event: any) {
    const file = event.target.files[0];
    if (file) {
      // Validate file type
      if (!file.type.startsWith('image/')) {
        this.errorMessage = 'Please select a valid image file';
        return;
      }

      // Validate file size (max 5MB)
      if (file.size > 5 * 1024 * 1024) {
        this.errorMessage = 'Image size should be less than 5MB';
        return;
      }

      // Compress and convert image to base64
      this.compressImage(file);
    }
  }

  compressImage(file: File) {
    const reader = new FileReader();
    reader.onload = (e: any) => {
      const img = new Image();
      img.onload = () => {
        // Create canvas for compression
        const canvas = document.createElement('canvas');
        const ctx = canvas.getContext('2d')!;
        
        // Calculate new dimensions (max 800x800)
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
        
        // Draw and compress image
        ctx.drawImage(img, 0, 0, width, height);
        
        // Convert to base64 with quality reduction (0.7 = 70% quality)
        const compressedBase64 = canvas.toDataURL('image/jpeg', 0.7);
        
        console.log('Image compressed. New size approx:', Math.round(compressedBase64.length / 1024), 'KB');
        this.product.imageUrl = compressedBase64;
        this.imagePreview = compressedBase64;
        this.errorMessage = '';
      };
      img.src = e.target.result;
    };
    reader.onerror = () => {
      this.errorMessage = 'Failed to read image file';
    };
    reader.readAsDataURL(file);
  }

  removeImage() {
    this.product.imageUrl = '';
    this.imagePreview = '';
  }

  onSubmit() {
    this.loading = true;
    this.successMessage = '';
    this.errorMessage = '';
    
    console.log('Sending product data...', { ...this.product, imageUrl: this.product.imageUrl?.substring(0, 50) + '...' });

    const productData = { ...this.product };

    if (this.editMode && this.editingProductId) {
      // Update existing product
      this.api.updateProduct(this.editingProductId, productData)
        .pipe(finalize(() => {
          this.loading = false;
        }))
        .subscribe({
          next: (response) => {
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
      // Create new product
      this.api.createProduct(productData)
        .pipe(finalize(() => {
          this.loading = false;
        }))
        .subscribe({
          next: (response) => {
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
    this.product = { ...product };
    this.imagePreview = product.imageUrl;
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
      imageUrl: ''
    };
    this.imagePreview = '';
    this.editMode = false;
    this.editingProductId = undefined;
    
    // Clear the file input element manually
    if (this.fileInput && this.fileInput.nativeElement) {
      this.fileInput.nativeElement.value = '';
    }
  }

  goBack() {
    this.router.navigate(['/']);
  }
}
