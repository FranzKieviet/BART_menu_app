// src/app/app.component.ts
import { Component } from '@angular/core';
import { ArrivalsComponent } from './arrivals.component'; // Adjust the path if necessary
import { CookieComponent } from './cookie/cookie.component';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.css'],
  standalone: true,
  imports: [ArrivalsComponent, CookieComponent]
})
export class AppComponent {
  title = 'BART Arrival Times';
}
