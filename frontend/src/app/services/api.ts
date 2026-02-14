import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, timeout } from 'rxjs';

@Injectable({
  providedIn: 'root',
})
export class Api {
  private apiUrl = 'http://localhost:8080/api';

  constructor(private http: HttpClient) {}

  // Products
  getProducts(): Observable<any[]> {
    return this.http.get<any[]>(`${this.apiUrl}/products`).pipe(
      timeout(30000) // 30 second timeout
    );
  }

  getProduct(id: number): Observable<any> {
    return this.http.get<any>(`${this.apiUrl}/products/${id}`);
  }

  createProduct(product: any): Observable<any> {
    return this.http.post<any>(`${this.apiUrl}/products`, product).pipe(
      timeout(60000) // 60 second timeout for large image uploads
    );
  }

  updateProduct(id: number, product: any): Observable<any> {
    return this.http.put<any>(`${this.apiUrl}/products/${id}`, product).pipe(
      timeout(60000) // 60 second timeout for large image uploads
    );
  }

  deleteProduct(id: number): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/products/${id}`);
  }

  // Cart
  getCart(userId: number): Observable<any[]> {
    return this.http.get<any[]>(`${this.apiUrl}/cart/${userId}`);
  }

  addToCart(cartItem: any): Observable<any> {
    return this.http.post<any>(`${this.apiUrl}/cart/add`, cartItem);
  }

  updateCartItemQuantity(itemId: number, quantity: number): Observable<any> {
    return this.http.put<any>(`${this.apiUrl}/cart/update/${itemId}`, { quantity });
  }

  removeFromCart(itemId: number): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/cart/remove/${itemId}`);
  }

  checkout(userId: number): Observable<void> {
    return this.http.post<void>(`${this.apiUrl}/cart/checkout/${userId}`, {});
  }

  // Orders
  getOrders(): Observable<any[]> {
    return this.http.get<any[]>(`${this.apiUrl}/orders`);
  }

  createOrder(order: any): Observable<any> {
    return this.http.post<any>(`${this.apiUrl}/orders`, order);
  }

  // Auth
  register(user: any): Observable<any> {
    return this.http.post<any>(`${this.apiUrl}/auth/register`, user);
  }

  login(credentials: any): Observable<any> {
    return this.http.post<any>(`${this.apiUrl}/auth/login`, credentials);
  }
}
