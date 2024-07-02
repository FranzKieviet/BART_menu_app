import { Component, Input, Output, EventEmitter } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { CookieService } from 'ngx-cookie-service';

@Component({
  selector: 'app-cookie',
  standalone: true,
  imports: [CommonModule, FormsModule],
  providers: [CookieService],
  templateUrl: './cookie.component.html',
  styleUrls: ['./cookie.component.css']
})
export class CookieComponent {
  stationCookieValue: string = '';
  city1CookieValue: string = '';
  city2CookieValue: string = '';
  cookieValueMessage: string = '';

  @Input() settingsClicked: boolean = false;

  constructor(private cookieService: CookieService) {}

  setCookie(name: string, value: string, days: number): void {
    const date = new Date();
    date.setTime(date.getTime() + (days * 24 * 60 * 60 * 1000));
    this.cookieService.set(name, value, date);
  }

  getCookie(name: string): string | null {
    return this.cookieService.get(name) || null;
  }

  onSetCookie(): void {
    this.setCookie('station', this.stationCookieValue, 7);
    this.setCookie('city1', this.city1CookieValue, 7);
    this.setCookie('city2', this.city2CookieValue, 7);
    alert(`We saved: Station -  ${this.stationCookieValue}, City 1: ${this.city1CookieValue}, City 2: ${this.city2CookieValue}`);
  }

  onGetCookie(): void {
    const cookieValue = this.getCookie('station');
    this.cookieValueMessage = cookieValue ? `Station -  ${this.stationCookieValue}, City 1: ${this.city1CookieValue}, City 2: ${this.city2CookieValue}` : 'Cookie not found';
  }
}
