import { Pipe, PipeTransform } from '@angular/core';

@Pipe({
  name: 'priceWithTax',
  standalone: true
})
export class PriceWithTaxPipe implements PipeTransform {
  transform(price: number, taxRate: number = 0.1, currency: string = 'USD'): string {
    const priceWithTax = price + (price * taxRate);
    const formatter = new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: currency,
      minimumFractionDigits: 2
    });
    
    return formatter.format(priceWithTax / 100); // Assuming price is in cents
  }
}
