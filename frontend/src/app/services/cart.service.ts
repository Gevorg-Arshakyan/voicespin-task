import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable } from 'rxjs';
import { CartItem } from '../models/order.model';
import { Product } from '../models/product.model';

@Injectable({
  providedIn: 'root'
})
export class CartService {
  private cartItemsSubject = new BehaviorSubject<CartItem[]>([]);
  public cartItems$ = this.cartItemsSubject.asObservable();

  constructor() {
    this.loadCartFromStorage();
  }

  get cartItems(): CartItem[] {
    return this.cartItemsSubject.value;
  }

  addToCart(product: Product, qty: number = 1): void {
    const currentItems = this.cartItems;
    const existingItemIndex = currentItems.findIndex(item => item.product._id === product._id);

    if (existingItemIndex > -1) {
      currentItems[existingItemIndex].qty += qty;
    } else {
      currentItems.push({ product, qty });
    }

    this.updateCart(currentItems);
  }

  updateQuantity(productId: string, qty: number): void {
    const currentItems = this.cartItems;
    const itemIndex = currentItems.findIndex(item => item.product._id === productId);

    if (itemIndex > -1) {
      if (qty <= 0) {
        currentItems.splice(itemIndex, 1);
      } else {
        currentItems[itemIndex].qty = qty;
      }
      this.updateCart(currentItems);
    }
  }

  removeFromCart(productId: string): void {
    const currentItems = this.cartItems.filter(item => item.product._id !== productId);
    this.updateCart(currentItems);
  }

  clearCart(): void {
    this.updateCart([]);
  }

  getCartTotal(): number {
    return this.cartItems.reduce((total, item) => total + (item.product.price * item.qty), 0);
  }

  getCartItemCount(): number {
    return this.cartItems.reduce((count, item) => count + item.qty, 0);
  }

  getCartTotalWithTax(taxRate: number = 0.1): number {
    const subtotal = this.getCartTotal();
    return subtotal + (subtotal * taxRate);
  }

  isEmpty(): boolean {
    return this.cartItems.length === 0;
  }

  private updateCart(items: CartItem[]): void {
    this.cartItemsSubject.next(items);
    this.saveCartToStorage(items);
  }

  private loadCartFromStorage(): void {
    try {
      const storedCart = localStorage.getItem('cart');
      if (storedCart) {
        const cartItems = JSON.parse(storedCart);
        this.cartItemsSubject.next(cartItems);
      }
    } catch (error) {
      console.error('Error loading cart from storage:', error);
    }
  }

  private saveCartToStorage(items: CartItem[]): void {
    try {
      localStorage.setItem('cart', JSON.stringify(items));
    } catch (error) {
      console.error('Error saving cart to storage:', error);
    }
  }
}
