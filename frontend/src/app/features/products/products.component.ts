import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RouterModule } from '@angular/router';
import { ApiService, ProductFilters } from '../../services/api.service';
import { CartService } from '../../services/cart.service';
import { Product, ProductsResponse } from '../../models/product.model';
import { ProductCardComponent } from '../../shared/components/product-card.component';
import { debounceTime, distinctUntilChanged, switchMap } from 'rxjs/operators';
import { Subject } from 'rxjs';

@Component({
  selector: 'app-products',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterModule, ProductCardComponent],
  templateUrl: './products.component.html'
})
export class ProductsComponent implements OnInit {
  products: Product[] = [];
  filters: ProductFilters = {
    page: 1,
    limit: 12,
    sortBy: 'createdAt',
    sortOrder: 'desc'
  };
  pagination: any = null;
  loading = false;
  cartItemCount = 0;

  private searchSubject = new Subject<string>();

  constructor(
    private apiService: ApiService,
    private cartService: CartService
  ) {
    this.searchSubject.pipe(
      debounceTime(500),
      distinctUntilChanged(),
      switchMap(searchTerm => {
        this.filters.search = searchTerm;
        this.filters.page = 1;
        return this.apiService.getProducts(this.filters);
      })
    ).subscribe(response => {
      this.products = response.products;
      this.pagination = response.pagination;
      this.loading = false;
    });
  }

  ngOnInit(): void {
    this.loadProducts();

    this.cartService.cartItems$.subscribe(items => {
      this.cartItemCount = this.cartService.getCartItemCount();
    });
  }

  loadProducts(): void {
    this.loading = true;
    this.apiService.getProducts(this.filters).subscribe({
      next: (response: ProductsResponse) => {
        this.products = response.products;
        this.pagination = response.pagination;
        this.loading = false;
      },
      error: (error) => {
        console.error('Error loading products:', error);
        this.loading = false;
      }
    });
  }

  onSearchChange(event: any): void {
    const searchTerm = event.target.value;
    this.loading = true;
    this.searchSubject.next(searchTerm);
  }

  goToPage(page: number): void {
    this.filters.page = page;
    this.loadProducts();
  }

  clearFilters(): void {
    this.filters = {
      page: 1,
      limit: 12,
      sortBy: 'createdAt',
      sortOrder: 'desc'
    };
    this.loadProducts();
  }

  onAddToCart(event: { product: Product, quantity: number }): void {
    this.cartService.addToCart(event.product, event.quantity);

    console.log(`Added ${event.quantity} ${event.product.name} to cart`);
  }
}
