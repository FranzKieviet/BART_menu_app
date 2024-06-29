// src/app/arrivals.component.ts
import { Component, OnInit, OnDestroy} from '@angular/core';
import { CommonModule } from '@angular/common';
import { CookieService } from 'ngx-cookie-service';


const stationAbbreviations: Record<string, string> = {
  "12TH ST. OAKLAND CITY CENTER": "12TH", "12TH": "12TH", "12TH ST.": "12TH", "12TH STREET": "12TH",
  "16TH ST. MISSION": "16TH", "16TH": "16TH", "16TH STREET": "16TH", "16TH ST.": "16TH",
  "19TH ST. OAKLAND": "19TH", "19TH": "19TH", "19TH ST.": "19TH", "19TH STREET": "19TH",
  "24TH ST. MISSION": "24TH", "24TH ST.": "24TH", "24TH": "24TH", "24TH STREEET": "24TH",
  "ASHBY": "ASHB", "ANTIOCH": "ANTC", "BALBOA PARK": "BALB", "BAY FAIR": "BAYF", "BERRYESSA": "BERY",
  "CASTRO VALLEY": "CAST", "CIVIC CENTER": "CIVC", "COLISEUM": "COLS", "COLMA": "COLM", "CONCORD": "CONC",
  "DALY CITY": "DALY", "DOWNTOWN BERKELEY": "DBRK", "DUBLIN/PLEASANTON": "DUBL", "EL CERRITO DEL NORTE": "DELN",
  "EL CERRITO PLAZA": "PLZA", "EMBARCADERO": "EMBR", "FREMONT": "FRMT",
  "FRUITVALE": "FTVL", "GLEN PARK": "GLEN", "HAYWARD": "HAYW",
  "LAFAYETTE": "LAFY", "LAKE MERRITT": "LAKE", "MACARTHUR": "MCAR", "MILLBRAE": "MLBR", "MILPITAS": "MLPT",
  "MONTGOMERY": "MONT", "NORTH BERKELEY": "NBRK", "NORTH CONCORD/MARTINEZ": "NCON", "ORINDA": "ORIN", "PITTSBURG/BAY POINT": "PITT",
  "PITTSBURG CENTER": "PCTR", "PLEASANT HILL": "PHIL", "POWELL": "POWL", "RICHMOND": "RICH", "ROCKRIDGE": "ROCK", "SAN BRUNO": "SBRN",
  "SFO": "SFIA", "SAN LEANDRO": "SANL", "SOUTH HAYWARD": "SHAY", "SOUTH SAN FRANCISCO": "SSAN", "UNION CITY": "UCTY",
  "WARM SPRINGS": "WARM", "WALNUT CREEK": "WCRK", "WEST DUBLIN": "WDUB", "WEST OAKLAND": "WOAK"
};


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

  function retrieveCookieValue(cookieService: CookieService): string {
    const cookieValue = cookieService.get('station');
    console.log('Cookie Value:', cookieValue);

    //If is a valid station, return the abrev:
    if(cookieValue.toUpperCase() in stationAbbreviations){
      console.log('Abrev:', stationAbbreviations[cookieValue.toUpperCase()]);
      return stationAbbreviations[cookieValue.toUpperCase()];
    }
    //Else, send an alert, set a default
    alert("Station not found, setting value for default")
    return "embr";
  }


@Component({
  selector: 'arrivals',
  templateUrl: './arrivals.component.html',
  styleUrls: ['./arrivals.component.css'],
  standalone: true,  // This makes it a standalone component
  imports: [CommonModule]
})


export class ArrivalsComponent implements OnInit, OnDestroy{ 
    //Current Times Variables:
    currentTime: string = '';
    refreshRate: number = 5000;
    //TimeId is used in setInterval, which returns a unique identifier
    //which helps when we need to stop the timer
    private timerId: any; 

    arrivalsData: ApiResponse | undefined;
    stationName: string | undefined;
    etd: Etd[] | undefined;
    
    constructor(private cookieService: CookieService) { }

    async fetchArrival(): Promise<ApiResponse> {
      //Get the station from the Cookie!
      const stationAbbrev = retrieveCookieValue(this.cookieService);
    
        //The key below is a public key
        const response = await fetch('https://api.bart.gov/api/etd.aspx?cmd=etd&orig=' + stationAbbrev +'&key=MW9S-E7SL-26DU-VV8V&json=y');
    
        if (!response.ok) {
            throw new Error('Network response was not ok' + response.statusText);
        }
    
        const data: ApiResponse = await response.json();
        console.log(data)
        return data;
    }

    ngOnInit() {
        this.updateTime();
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

    private updateTime() {
        const now = new Date();
        this.currentTime = now.toLocaleTimeString();
    }
    
    private updateBART(){
        if(this.arrivalsData == undefined){
            return;
        }
        this.stationName = this.arrivalsData.root.station[0].name;
        this.etd = this.arrivalsData.root.station[0].etd
    }

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
