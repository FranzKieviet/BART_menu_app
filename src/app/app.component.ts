// src/app/app.component.ts
import { Component, ViewChild, Input, Output, EventEmitter } from '@angular/core';
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


  @Input() stationName: string = '';
  @Input() currentTime: string = ''
  settingsClicked: boolean = false;

  @Output() settingsClickedChange: EventEmitter<boolean> = new EventEmitter<boolean>();

  //Gets and updates the station name within the class
  onStationNameChange(newStationName: string) {
    this.stationName = newStationName;
    console.log("New StationName: "+ this.stationName);
  }

  //Gets and updates the time within the class
  onTimeChange(newTime: string) {
    this.currentTime = newTime;
    console.log("New Time: "+ this.currentTime);
  }

  //Emits message that the setting button has been clicked
  settingsButtonClicked() {
    console.log("Click")
    this.settingsClicked = !this.settingsClicked;
    this.settingsClickedChange.emit(this.settingsClicked);
  }
}
