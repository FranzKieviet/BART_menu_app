// src/app/app.component.ts
import { Component, ViewChild, AfterViewInit } from '@angular/core';
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
  @ViewChild(ArrivalsComponent) arrivalsComponent!: ArrivalsComponent;


  stationName: string = '';
  currentTime: string = ''


  onStationNameChange(newStationName: string) {
    this.stationName = newStationName;
    console.log("New StationName: "+ this.stationName);
  }

  onTimeChange(newTime: string) {
    this.currentTime = newTime;
    console.log("New Time: "+ this.currentTime);
  }
}
