import { Pipe, PipeTransform } from '@angular/core';

@Pipe({
  name: 'highlightSearch',
  standalone: true
})
export class HighlightSearchPipe implements PipeTransform {
  transform(text: string, search: string): string {
    if (!search || !text) {
      return text;
    }

    const pattern = search.replace(/[\-\[\]\/\{\}\(\)\*\+\?\.\\\^\$\|]/g, "\\$&");
    const regex = new RegExp(pattern, 'gi');
    
    return text.replace(regex, (match) => `<mark class="bg-yellow-200 px-1 rounded">${match}</mark>`);
  }
}
