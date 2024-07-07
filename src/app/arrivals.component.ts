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
    properties: Properties;
  }
  
  interface Properties {
    forecastGridData: string;
  }

  interface weatherForecastApiResponse {
    properties: PropertiesForecast;
  }
  
  interface PropertiesForecast {
    temperature: Weather;
    maxTemperature: Weather;
    minTemperature: Weather;
  }

  interface Weather{
    umo: string;
    values: WeatherValues[]; 
  }

  interface WeatherValues{
    validTime: string;
    value: string;
  }

  interface WeatherToDisplay{
    dates: string[];
    temperatures: string[];
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

    highs: string[][] | undefined;
    lows: string[][] | undefined;

    //We want to check for changes, and left app.component know
    @Output() stationNameChange: EventEmitter<string> = new EventEmitter<string>();
    @Output() timeChange: EventEmitter<string> = new EventEmitter<string>(); 

    //Weather Data:
    forecastData: PropertiesForecast | undefined;
    
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
        const response = await fetch('https://api.weather.gov/points/' + lat + ',' + long);
    
        if (!response.ok) {
            throw new Error('Network response was not ok' + response.statusText);
        }
    
        const data: weatherApiResponse = await response.json();
        const locationAPI =  data.properties.forecastGridData;

        const responseForecast = await fetch(locationAPI);
        console.log(locationAPI);
    
        if (!responseForecast.ok) {
            throw new Error('Network response was not ok' + response.statusText);
        }

        const forecastData: weatherForecastApiResponse = await responseForecast.json();
        this.forecastData = forecastData.properties;
        console.log(this.forecastData.temperature.values[0].value);

        this.getHighsandLows();
    }

    //Helper Functions:
    
    //Zipcode to Lat, Long


    //UTC to PST:

    //C to F:
    celsiusToFahrenheit(celsius: number): number {
      return (celsius * 9/5) + 32;
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

    //Fuction to fill the weather forecast for the week 
    getHighsandLows(){
      if (this.forecastData == undefined){
        return;
      }
      
      const maxData = this.forecastData.maxTemperature.values
      const minData = this.forecastData.minTemperature.values
      this.highs = [];
      this.lows = [];

      //Run through the date for the next week and get the highs
      for(let i=0; i<7; i++){
        let d = this.parseDate(maxData[i].validTime);
        let tHigh = this.celsiusToFahrenheit(parseFloat(maxData[i].value));
        let tLow = this.celsiusToFahrenheit(parseFloat(minData[i].value));

        let dayTemps: string[] = [d, tHigh.toString(), tLow.toString()];

        console.log(dayTemps);
        this.highs.push(dayTemps);
      }
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
  
    private initializeApp() {
      this.fetchWeather("37.9161","-122.3108");
      this.updateTime();
      this.fetchAndSetArrival();
      //Check if there are cookies set:
      if(this.cookieService.get('stationAbrev') == ''){
        this.cookieService.set('stationAbrev', DEFAULTSTATIONABREV);
      }
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