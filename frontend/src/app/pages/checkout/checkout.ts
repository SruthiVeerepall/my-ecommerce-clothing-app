import { Component, OnInit, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { Api } from '../../services/api';
import { CartService } from '../../services/cart.service';

@Component({
  selector: 'app-checkout',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './checkout.html',
  styleUrl: './checkout.css',
})
export class Checkout implements OnInit {
  checkoutForm: FormGroup;
  cartItems: any[] = [];
  total: number = 0;
  isSubmitting = false;
  detectedCardType: string = '';

  constructor(
    private fb: FormBuilder,
    private api: Api,
    private cartService: CartService,
    private router: Router,
    private cdr: ChangeDetectorRef
  ) {
    this.checkoutForm = this.fb.group({
      personalInfo: this.fb.group({
        firstName: ['', Validators.required],
        lastName: ['', Validators.required],
        email: ['', [Validators.required, Validators.email]],
        phone: ['', Validators.required]
      }),
      shippingAddress: this.fb.group({
        address: ['', Validators.required],
        city: ['', Validators.required],
        state: ['', Validators.required],
        zipCode: ['', Validators.required]
      }),
      paymentInfo: this.fb.group({
        cardType: ['credit', Validators.required],
        cardHolder: ['', Validators.required],
        cardNumber: ['', [Validators.required, Validators.pattern('^[0-9]{16}$')]],
        expiryDate: ['', [Validators.required, Validators.pattern('^(0[1-9]|1[0-2])\/([0-9]{2})$')]],
        cvv: ['', [Validators.required, Validators.pattern('^[0-9]{3,4}$')]]
      })
    });

    // Watch for card number changes to detect card type
    this.checkoutForm.get('paymentInfo.cardNumber')?.valueChanges.subscribe(value => {
      this.detectCardType(value);
    });
  }

  detectCardType(number: string) {
    if (!number) {
      this.detectedCardType = '';
      return;
    }

    if (number.startsWith('4')) {
      this.detectedCardType = 'Visa';
    } else if (/^5[1-5]/.test(number) || /^2[2-7]/.test(number)) {
      this.detectedCardType = 'Mastercard';
    } else if (/^3[47]/.test(number)) {
      this.detectedCardType = 'American Express';
    } else if (/^6(?:011|5|4|22)/.test(number)) {
      this.detectedCardType = 'Discover';
    } else {
      this.detectedCardType = 'Unknown';
    }
  }

  ngOnInit(): void {
    const userId = Number(localStorage.getItem('userId') || '1');
    this.api.getCart(userId).subscribe({
      next: (items) => {
        this.cartItems = items;
        this.calculateTotal();
      },
      error: (err) => console.error('Error fetching cart items:', err)
    });
  }

  calculateTotal() {
    this.total = this.cartItems.reduce((acc, item) => {
      const price = Number(item.product?.price || item.price || 0);
      const quantity = Number(item.quantity || 0);
      return acc + (price * quantity);
    }, 0);
    // Trigger change detection to update the UI
    this.cdr.markForCheck();
  }

  onSubmit() {
    if (this.checkoutForm.valid) {
      this.isSubmitting = true;
      const userId = Number(localStorage.getItem('userId') || '1');
      
      // In a real app, you'd send order data to backend
      this.api.checkout(userId).subscribe({
        next: () => {
          this.cartService.updateCartCount(0);
          alert('Order placed successfully!');
          this.router.navigate(['/']);
        },
        error: (err) => {
          console.error('Checkout error:', err);
          alert('There was an error processing your order.');
          this.isSubmitting = false;
        }
      });
    } else {
      this.markFormGroupTouched(this.checkoutForm);
    }
  }

  markFormGroupTouched(formGroup: FormGroup) {
    Object.values(formGroup.controls).forEach(control => {
      if (control instanceof FormGroup) {
        this.markFormGroupTouched(control);
      } else {
        control.markAsTouched();
      }
    });
  }
}
