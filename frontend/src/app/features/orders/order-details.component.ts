import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, RouterModule } from '@angular/router';
import { ApiService } from '../../services/api.service';
import { OrderWithProducts } from '../../models/order.model';
import { PriceWithTaxPipe } from '../../pipes/price-with-tax.pipe';

@Component({
  selector: 'app-order-details',
  standalone: true,
  imports: [CommonModule, RouterModule, PriceWithTaxPipe],
  templateUrl: './order-details.component.html'
})
export class OrderDetailsComponent implements OnInit {
  order: OrderWithProducts | null = null;
  loading = true;
  error = '';

  constructor(
    private route: ActivatedRoute,
    private apiService: ApiService
  ) {}

  ngOnInit(): void {
    const orderId = this.route.snapshot.paramMap.get('id');
    if (orderId) {
      this.loadOrder(orderId);
    } else {
      this.error = 'No order ID provided';
      this.loading = false;
    }
  }

  loadOrder(orderId: string): void {
    this.apiService.getOrderById(orderId).subscribe({
      next: (order) => {
        this.order = order;
        this.loading = false;
      },
      error: (error) => {
        console.error('Error loading order:', error);
        this.error = error.error?.error || 'Failed to load order details';
        this.loading = false;
      }
    });
  }

  getSubtotal(): number {
    if (!this.order) return 0;
    return this.order.items.reduce((total, item) => 
      total + (item.priceAtPurchase * item.qty), 0
    );
  }

  getTax(): number {
    const subtotal = this.getSubtotal();
    return subtotal * 0.1;
  }

  printOrder(): void {
    window.print();
  }
}
