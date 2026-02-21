import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router, ActivatedRoute } from '@angular/router';
import { Api } from '../../services/api';
import { CartService } from '../../services/cart.service';

interface Product {
  id: number;
  name: string;
  description: string;
  price: number;
  imageUrl: string;
  category?: string;
  sizes?: string[];
  colors?: string[];
  occasion?: string;
  createdAt?: string;
  rating?: number;
  sales?: number;
}

@Component({
  selector: 'app-shop',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './shop.html',
  styleUrls: ['./shop.css']
})
export class ShopComponent implements OnInit {
  allProducts: Product[] = [];
  filteredProducts: Product[] = [];
  
  // Filter options
  selectedCategory: string = 'all';
  selectedSize: string = 'all';
  selectedOccasion: string = 'all';
  
  // Sort option
  sortBy: string = 'newest';
  
  // Filter lists
  categories: string[] = ['Sarees', 'Lehengas', 'Kurties', 'Kids'];
  sizes: string[] = ['XS', 'S', 'M', 'L', 'XL', 'XXL', 'Free Size'];
  occasions: string[] = ['Wedding', 'Festival', 'Party', 'Casual', 'Formal', 'Traditional'];
  sortOptions = [
    { value: 'price-low', label: 'Price: Low to High' },
    { value: 'price-high', label: 'Price: High to Low' },
    { value: 'newest', label: 'Newest Arrivals' },
    { value: 'best-selling', label: 'Best Selling' }
  ];
  
  // UI state
  showFilters: boolean = true;
  searchQuery: string = '';
  isLoading: boolean = true;

  constructor(
    private api: Api,
    private cartService: CartService,
    private router: Router,
    private route: ActivatedRoute
  ) {}

  ngOnInit(): void {
    this.loadProducts();
    
    // Check for category from query params
    this.route.queryParams.subscribe(params => {
      if (params['category']) {
        this.selectedCategory = params['category'];
        this.applyFilters();
      }
    });
  }

  loadProducts(): void {
    this.isLoading = true;
    this.api.getProducts().subscribe({
      next: (response: any) => {
        this.allProducts = response.map((p: any) => ({
          ...p,
          category: p.category || this.assignRandomCategory(),
          sizes: p.sizes || this.getRandomSizes(),
          occasion: p.occasion || this.getRandomOccasion(),
          createdAt: p.createdAt || new Date().toISOString(),
          rating: p.rating || this.getRandomRating(),
          sales: p.sales || this.getRandomSales()
        }));
        
        this.filteredProducts = [...this.allProducts];
        this.applyFilters();
        this.isLoading = false;
      },
      error: (error: any) => {
        console.error('Error loading products:', error);
        this.isLoading = false;
      }
    });
  }

  applyFilters(): void {
    let filtered = [...this.allProducts];
    
    // Category filter
    if (this.selectedCategory !== 'all') {
      filtered = filtered.filter(p => p.category === this.selectedCategory);
    }
    
    // Size filter
    if (this.selectedSize !== 'all') {
      filtered = filtered.filter(p => p.sizes && p.sizes.includes(this.selectedSize));
    }
    
    // Occasion filter
    if (this.selectedOccasion !== 'all') {
      filtered = filtered.filter(p => p.occasion === this.selectedOccasion);
    }
    
    // Search filter
    if (this.searchQuery.trim()) {
      const query = this.searchQuery.toLowerCase();
      filtered = filtered.filter(p => 
        p.name.toLowerCase().includes(query) || 
        (p.description && p.description.toLowerCase().includes(query))
      );
    }
    
    // Apply sorting
    this.applySorting(filtered);
    
    this.filteredProducts = filtered;
  }

  applySorting(products: Product[]): void {
    switch (this.sortBy) {
      case 'price-low':
        products.sort((a, b) => a.price - b.price);
        break;
      case 'price-high':
        products.sort((a, b) => b.price - a.price);
        break;
      case 'newest':
        products.sort((a, b) => {
          const dateA = new Date(a.createdAt || 0).getTime();
          const dateB = new Date(b.createdAt || 0).getTime();
          return dateB - dateA;
        });
        break;
      case 'best-selling':
        products.sort((a, b) => (b.sales || 0) - (a.sales || 0));
        break;
    }
  }

  onFilterChange(): void {
    this.applyFilters();
  }

  onSortChange(): void {
    this.applyFilters();
  }

  clearFilters(): void {
    this.selectedCategory = 'all';
    this.selectedSize = 'all';
    this.selectedOccasion = 'all';
    this.searchQuery = '';
    this.sortBy = 'newest';
    this.applyFilters();
  }

  toggleFilters(): void {
    this.showFilters = !this.showFilters;
  }

  addToCart(product: Product): void {
    const userId = Number(localStorage.getItem('userId') || '1');
    const cartItem = {
      userId: userId,
      productId: product.id,
      quantity: 1,
      selectedSize: product.sizes && product.sizes.length > 0 ? product.sizes[0] : 'Free Size',
      selectedColor: product.colors && product.colors.length > 0 ? product.colors[0] : 'Default'
    };
    
    this.api.addToCart(cartItem).subscribe({
      next: () => {
        this.cartService.incrementCartCount(1);
        alert('Product added to cart! View product details to select specific size/color.');
      },
      error: (error: any) => {
        console.error('Error adding to cart:', error);
        alert('Failed to add product to cart');
      }
    });
  }

  viewProduct(productId: number): void {
    this.router.navigate(['/product', productId]);
  }

  // Helper functions for mock data
  private assignRandomCategory(): string {
    return this.categories[Math.floor(Math.random() * this.categories.length)];
  }

  private getRandomSizes(): string[] {
    const count = Math.floor(Math.random() * 3) + 2;
    return this.sizes.slice(0, count);
  }

  private getRandomOccasion(): string {
    return this.occasions[Math.floor(Math.random() * this.occasions.length)];
  }

  private getRandomRating(): number {
    return Math.floor(Math.random() * 2) + 4; // 4 or 5 stars
  }

  private getRandomSales(): number {
    return Math.floor(Math.random() * 500) + 100;
  }
}
