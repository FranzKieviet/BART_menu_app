// src/app/arrivals.component.ts
import { Component, OnInit, OnDestroy} from '@angular/core';
import { CommonModule } from '@angular/common';



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

async function fetchArrival(): Promise<ApiResponse> {
    const response = await fetch('https://api.bart.gov/api/etd.aspx?cmd=etd&orig=EMBR&key=MW9S-E7SL-26DU-VV8V&json=y');

    if (!response.ok) {
        throw new Error('Network response was not ok' + response.statusText);
    }

    const data: ApiResponse = await response.json();
    console.log(data)
    return data;
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

           for(let j in line.estimate){
            let estimate = line.estimate[j];

            //Fix color casing:
            estimate.color = estimate.color[0] + estimate.color.slice(1).toLowerCase();
            //Change Leaving to 0
            if (estimate.minutes == "Leaving"){
                estimate.minutes = "0"
            }
            if (estimate.minutes.length == 1){
              estimate.minutes = "  " + estimate.minutes

            }
           }

        }
    }

    private async fetchAndSetArrival() {
        try {
            const arrivalData = await fetchArrival();
            this.arrivalsData = arrivalData;
            this.updateBART();
            this.cleanBART()
        } catch (error) {
            console.error('Error fetching arrival data:', error);
        }
    }
    
}
