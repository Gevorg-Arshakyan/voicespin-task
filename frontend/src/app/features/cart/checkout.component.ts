import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router, RouterModule } from '@angular/router';
import { CartService } from '../../services/cart.service';
import { ApiService } from '../../services/api.service';
import { CartItem, CreateOrderRequest } from '../../models/order.model';
import { PriceWithTaxPipe } from '../../pipes/price-with-tax.pipe';

@Component({
  selector: 'app-checkout',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterModule, PriceWithTaxPipe],
  templateUrl: './checkout.component.html'
})
export class CheckoutComponent implements OnInit {
  cartItems: CartItem[] = [];
  discountCode = '';
  appliedDiscount: any = null;
  discountError = '';
  submitting = false;
  orderError = '';

  constructor(
    private cartService: CartService,
    private apiService: ApiService,
    private router: Router
  ) {}

  ngOnInit(): void {
    this.cartService.cartItems$.subscribe(items => {
      this.cartItems = items;
    });
  }

  get subtotal(): number {
    return this.cartItems.reduce((total, item) => total + (item.product.price * item.qty), 0);
  }

  get tax(): number {
    return this.subtotal * 0.1;
  }

  get discountAmount(): number {
    if (this.appliedDiscount) {
      return (this.subtotal * this.appliedDiscount.percent) / 100;
    }
    return 0;
  }

  get total(): number {
    return this.subtotal + this.tax - this.discountAmount;
  }

  updateQuantity(productId: string, quantity: number): void {
    if (quantity <= 0) {
      this.removeItem(productId);
    } else {
      this.cartService.updateQuantity(productId, quantity);
    }
  }

  removeItem(productId: string): void {
    this.cartService.removeFromCart(productId);
  }

  applyDiscount(): void {
    this.discountError = '';
    
    if (this.discountCode.toUpperCase() === 'SAVE5') {
      this.appliedDiscount = { percent: 5, description: '5% off' };
      this.discountError = '';
    } else {
      this.discountError = 'Invalid discount code';
      this.appliedDiscount = null;
    }
  }

  submitOrder(): void {
    if (this.cartItems.length === 0) return;

    this.submitting = true;
    this.orderError = '';

    const orderData: CreateOrderRequest = {
      items: this.cartItems.map(item => ({
        productId: item.product._id,
        qty: item.qty
      })),
      discountCode: this.appliedDiscount ? this.discountCode.toUpperCase() : undefined
    };

    this.apiService.createOrder(orderData).subscribe({
      next: (order) => {
        this.cartService.clearCart();
        this.router.navigate(['/orders', order._id]);
      },
      error: (error) => {
        console.error('Order error:', error);
        this.orderError = error.error?.error || 'Failed to place order. Please try again.';
        this.submitting = false;
      }
    });
  }
}
