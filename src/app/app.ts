import { Component } from '@angular/core';
import { RouterOutlet } from '@angular/router';

@Component({
  selector: 'orion-root',
  imports: [RouterOutlet],
  template: '<router-outlet />',
})
export class App {}
