import { Component, Input, Output, EventEmitter } from '@angular/core';
import { CommonModule } from '@angular/common';
import {PriceWithTaxPipe} from "../../pipes/price-with-tax.pipe";
import {HighlightSearchPipe} from "../../pipes/highlight-search.pipe";
import {Product} from "../../models/product.model";

@Component({
  selector: 'app-product-card',
  standalone: true,
  imports: [CommonModule, PriceWithTaxPipe, HighlightSearchPipe],
  templateUrl: './product-card.component.html'
})
export class ProductCardComponent {
  @Input() product!: Product;
  @Input() searchTerm: string = '';
  @Output() addToCartEvent = new EventEmitter<{ product: Product, quantity: number }>();

  quantity = 1;

  incrementQuantity(): void {
    if (this.quantity < this.product.stock) {
      this.quantity++;
    }
  }

  decrementQuantity(): void {
    if (this.quantity > 1) {
      this.quantity--;
    }
  }

  addToCart(): void {
    if (this.product.stock > 0) {
      this.addToCartEvent.emit({ product: this.product, quantity: this.quantity });
      this.quantity = 1;
    }
  }
}
