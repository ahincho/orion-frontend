import { Component, inject } from '@angular/core';
import { RouterOutlet } from '@angular/router';

import { ThemeService } from './core/theme/theme.service';

@Component({
  selector: 'orion-root',
  imports: [RouterOutlet],
  template: '<router-outlet />',
})
export class App {
  // Instantiating the service here ensures the data-theme attribute is set
  // on the document root before any route renders.
  private readonly theme = inject(ThemeService);
}