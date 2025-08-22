import { Routes } from '@angular/router';
import { CartGuard } from './guards/cart.guard';

export const routes: Routes = [
  { path: '', redirectTo: '/products', pathMatch: 'full' },
  { 
    path: 'products', 
    loadComponent: () => import('./features/products/products.component').then(m => m.ProductsComponent)
  },
  { 
    path: 'checkout', 
    loadComponent: () => import('./features/cart/checkout.component').then(m => m.CheckoutComponent),
    canActivate: [CartGuard]
  },
  { 
    path: 'orders/:id', 
    loadComponent: () => import('./features/orders/order-details.component').then(m => m.OrderDetailsComponent)
  },
  { path: '**', redirectTo: '/products' }
];
