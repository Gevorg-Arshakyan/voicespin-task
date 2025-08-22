import { Product } from './product.model';

export interface OrderItem {
  productId: string;
  qty: number;
  priceAtPurchase: number;
}

export interface Order {
  _id: string;
  items: OrderItem[];
  total: number;
  discountCode?: string;
  discountAmount: number;
  createdAt: string;
}

export interface OrderWithProducts {
  _id: string;
  items: Array<{
    productId: Product;
    qty: number;
    priceAtPurchase: number;
  }>;
  total: number;
  discountCode?: string;
  discountAmount: number;
  createdAt: string;
}

export interface CartItem {
  product: Product;
  qty: number;
}

export interface CreateOrderRequest {
  items: Array<{
    productId: string;
    qty: number;
  }>;
  discountCode?: string;
}
