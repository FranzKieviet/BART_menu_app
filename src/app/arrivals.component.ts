// src/app/arrivals.component.ts
import { Component, OnInit, OnDestroy, Input,  Output, EventEmitter} from '@angular/core';
import { CommonModule } from '@angular/common';
import { CookieService } from 'ngx-cookie-service';


interface Estimate {
    minutes: string;
    platform: string;
    direction: string;
    length: string;
    color: string;
    hexcolor: string;
    bikeflag: string;
    delay: string;
    cancelflag: string;
    dynamicflag: string;
  }
  
  interface Etd {
    destination: string;
    abbreviation: string;
    limited: string;
    estimate: Estimate[];
  }
  
  interface Station {
    name: string;
    abbr: string;
    etd: Etd[];
  }
  
  interface Root {
    station: Station[];
  }
  
  interface ApiResponse {
    root: Root;
  }

  interface weatherApiResponse {
    hourly: Hourly;
    daily: Daily;
  }
  
  interface Hourly {
    time: string[];
    temperature_2m: number[];
    apparent_teperature: number[];
    precipitation_probability: number[];
    precipitation: number[];
    rain: number[];
    showers: number[];
  }

  interface Daily {
    time: string[];
    temperature_2m_max: number[];
    temperature_2m_min: number[];
    precipitation_sum: number[];
    rain_sum: number[];
    showers_sum: number[];
  }

  const DEFAULTSTATIONABREV = 'LAKE'

@Component({
  selector: 'arrivals',
  templateUrl: './arrivals.component.html',
  styleUrls: ['./arrivals.component.css'],
  standalone: true,  // This makes it a standalone component
  imports: [CommonModule]
})

export class ArrivalsComponent implements OnInit, OnDestroy{ 
    refreshRate: number = 5000;
    //TimeId is used in setInterval, which returns a unique identifier
    //which helps when we need to stop the timer
    private timerId: any;
    etd: Etd[] | undefined;
    arrivalsData: ApiResponse | undefined;
    

    //These values get passed to app.component, so we need to mark them as input and output
    stationName: string | undefined;
    currentTime: string | undefined;

    week: string[] | undefined;
    highs: number[] = [0,0,0,0,0,0];
    lows: number[] = [0,0,0,0,0,0];
    icons: string[] = ['rainy', 'rainy', 'sunny', 'sunny', 'rainy'];

    //We want to check for changes, and left app.component know
    @Output() stationNameChange: EventEmitter<string> = new EventEmitter<string>();
    @Output() timeChange: EventEmitter<string> = new EventEmitter<string>(); 

    //Weather Data:
    forecastData: weatherApiResponse | undefined;
    
    constructor(private cookieService: CookieService) { }

    async fetchArrival(): Promise<ApiResponse> {
      //Get the station from the Cookie!
      const stationAbbrev = this.cookieService.get('stationAbrev');
    
        //The key below is a public key
        const response = await fetch('https://api.bart.gov/api/etd.aspx?cmd=etd&orig=' + stationAbbrev +'&key=MW9S-E7SL-26DU-VV8V&json=y');
    
        if (!response.ok) {
            throw new Error('Network response was not ok' + response.statusText);
        }
    
        const data: ApiResponse = await response.json();
        return data;
    }

    async fetchWeather(lat: string, long:string) {
        //The key below is a public key
        const response = await fetch('https://api.open-meteo.com/v1/forecast?latitude='+ lat +'&longitude='+long+'&current=temperature_2m&hourly=temperature_2m,apparent_temperature,precipitation_probability,precipitation,rain,showers,snowfall&daily=temperature_2m_max,temperature_2m_min,precipitation_sum,rain_sum,showers_sum&temperature_unit=fahrenheit&precipitation_unit=inch&timezone=America%2FLos_Angeles');
    
        if (!response.ok) {
            throw new Error('Network response was not ok' + response.statusText);
        }
    
        const data: weatherApiResponse = await response.json();
        this.forecastData = data;
        console.log(data.hourly.time[0]);
        console.log(data.hourly.temperature_2m[0]);
    }

    //Helper Functions:
    
    //Zipcode to Lat, Long
    //TODO
    getFillWidth(low: number, high: number): string {
      // Calculate the width as a percentage based on the temperature range
      const tempRange = high - low;
      const maxTempRange = 20; // Adjust this based on your expected temperature range
      const percentage = (tempRange / maxTempRange) * 100;
      return `${percentage}%`;
    }

    //Get the highs and lows:
    updateHighsAndLows(){
      
      this.week = [];
      this.highs = [];
      this.lows = [];
      const data = this.forecastData
      
      if (data == undefined){
        console.log("No data for high and lows!");
        return;
      }

      for (let i=0; i<7; i++){
        this.week.push(this.getDayOfWeek(data.daily.time[i]));
        this.highs.push(Math.round(data.daily.temperature_2m_max[i]));
        this.lows.push(Math.round(data.daily.temperature_2m_min[i]));
      }
      console.log(this.week)
      return;
    }

    getDayOfWeek(dateString: string): string {
      const date = new Date(dateString);
      const daysOfWeek = ['MON', 'TUE', 'WED', 'THU', 'FRI', 'SAT', 'SUN'];
      const dayIndex = date.getDay();
      return daysOfWeek[dayIndex];
  }
    //Get the Date from the weatherAPI:
    parseDate(date: string){
      //Example from API: 2024-07-05
      let year = parseInt(date.substring(0, 4), 10);
      let month = parseInt(date.substring(5, 7), 10);
      let day = parseInt(date.substring(8, 10), 10);

      if(month < 10 ){
        month = month % 10;
      }

      //If we want to return Date object instead:
      //let month = parseInt(date.substring(5, 7), 10) - 1; //Months are 0-indexed :/
      //const newDate = new Date(year, month, day);

      return String(month) + "/" + String(day)
    }

    ngOnInit() {
      this.initializeApp();
  
      // Set up interval to update time and fetch BART data
      this.timerId = setInterval(() => {
        this.updateTime();
        this.fetchAndSetArrival();
      }, this.refreshRate);
      
    }
  
    ngOnDestroy() {
      if (this.timerId) {
        clearInterval(this.timerId);
      }
    }
  
    private async initializeApp() {
      await this.fetchWeather("37.9161","-122.3108");
      this.updateTime();
      this.fetchAndSetArrival();
      //Check if there are cookies set:
      if(this.cookieService.get('stationAbrev') == ''){
        this.cookieService.set('stationAbrev', DEFAULTSTATIONABREV);
      }

      this.updateHighsAndLows();
      console.log("Intial init complete");
    }

    private updateTime() {
        const now = new Date();
        this.currentTime = now.toLocaleTimeString();

        this.timeChange.emit(this.currentTime);
    }
    
    //This method helps get some needed info that is used in other methods
    private updateBART(){
        if(this.arrivalsData == undefined){
            return;
        }
        this.stationName = this.arrivalsData.root.station[0].name;
        this.etd = this.arrivalsData.root.station[0].etd

        //Emit change so that the app component knows:
        this.stationNameChange.emit(this.stationName);
    }

    //Cleans the input and fixes any option errors down the road
    private cleanBART(){
        if(this.etd == undefined){
            return;
        }

        for(let i in this.etd){
          let index = parseInt(i);
          let line = this.etd[i];

          //At the end of the day, a line may have less than two trains:
          while(line.estimate.length < 3){
            let newEstimate: Estimate = {
              minutes: '--',
              platform: '0',
              direction: 'Northbound',
              length: '0',
              color: 'Black',
              hexcolor: '#000000',
              bikeflag: '0',
              delay: '0',
              cancelflag: '1',
              dynamicflag: '0'
          };

            line.estimate.push(newEstimate);
          }

          for(let j in line.estimate){
            let estimate = line.estimate[j];
            
            //Change Leaving to 0
            if (estimate.minutes == "Leaving"){
                estimate.minutes = "0"
            }
            //This is here to make it so there is a space if the number is a single digit
            //Just makes it look pretty later on, no other functional purpose
            if (estimate.minutes.length == 1){
              estimate.minutes = "  " + estimate.minutes
            }
          }
        }
    }

    private async fetchAndSetArrival() {
        try {
            const arrivalData = await this.fetchArrival();
            this.arrivalsData = arrivalData;
            this.updateBART();
            this.cleanBART()
        } catch (error) {
            console.error('Error fetching arrival data:', error);
        }
    }
    
}