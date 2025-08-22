import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { Product, ProductsResponse } from '../models/product.model';
import { Order, OrderWithProducts, CreateOrderRequest } from '../models/order.model';
import { environment } from '../../environments/environment';

export interface ProductFilters {
  search?: string;
  category?: string;
  minPrice?: number;
  maxPrice?: number;
  sortBy?: string;
  sortOrder?: 'asc' | 'desc';
  page?: number;
  limit?: number;
}

export interface SalesStats {
  dateRange: {
    startDate: string;
    endDate: string;
  };
  overallStats: {
    totalRevenue: number;
    totalOrders: number;
    averageOrderValue: number;
    totalDiscounts: number;
  };
  dailySales: Array<{
    date: string;
    totalSales: number;
    orderCount: number;
  }>;
  topCategories: Array<{
    category: string;
    totalQuantity: number;
    totalRevenue: number;
    orderCount: number;
  }>;
  topProducts: Array<{
    productId: string;
    name: string;
    category: string;
    totalQuantity: number;
    totalRevenue: number;
  }>;
  topSellingCategory: string | null;
}

@Injectable({
  providedIn: 'root'
})
export class ApiService {
  private readonly baseUrl = environment.apiUrl;

  constructor(private http: HttpClient) {}

  // Product APIs
  getProducts(filters?: ProductFilters): Observable<ProductsResponse> {
    let params = new HttpParams();
    
    if (filters) {
      Object.keys(filters).forEach(key => {
        const value = (filters as any)[key];
        if (value !== undefined && value !== null && value !== '') {
          params = params.set(key, value.toString());
        }
      });
    }

    return this.http.get<ProductsResponse>(`${this.baseUrl}/products`, { params });
  }

  getProductById(id: string): Observable<Product> {
    return this.http.get<Product>(`${this.baseUrl}/products/${id}`);
  }

  createProduct(product: Partial<Product>): Observable<Product> {
    return this.http.post<Product>(`${this.baseUrl}/products`, product);
  }

  updateProduct(id: string, product: Partial<Product>): Observable<Product> {
    return this.http.put<Product>(`${this.baseUrl}/products/${id}`, product);
  }

  // Order APIs
  createOrder(orderData: CreateOrderRequest): Observable<OrderWithProducts> {
    return this.http.post<OrderWithProducts>(`${this.baseUrl}/orders`, orderData);
  }

  getOrderById(id: string): Observable<OrderWithProducts> {
    return this.http.get<OrderWithProducts>(`${this.baseUrl}/orders/${id}`);
  }

  getOrders(page: number = 1, limit: number = 10): Observable<{ orders: OrderWithProducts[], pagination: any }> {
    const params = new HttpParams()
      .set('page', page.toString())
      .set('limit', limit.toString());
    
    return this.http.get<{ orders: OrderWithProducts[], pagination: any }>(`${this.baseUrl}/orders`, { params });
  }

  // Stats APIs
  getSalesStats(startDate?: string, endDate?: string): Observable<SalesStats> {
    let params = new HttpParams();
    
    if (startDate) params = params.set('startDate', startDate);
    if (endDate) params = params.set('endDate', endDate);

    return this.http.get<SalesStats>(`${this.baseUrl}/stats/sales`, { params });
  }
}
