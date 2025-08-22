export interface Product {
  _id: string;
  name: string;
  category: string;
  price: number;
  stock: number;
  createdAt: string;
  updatedAt: string;
}

export interface ProductsResponse {
  products: Product[];
  pagination: {
    current: number;
    pages: number;
    total: number;
    limit: number;
  };
}
