import { Component, Input} from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { CookieService } from 'ngx-cookie-service';

const DEFAULTSTATION = 'LAKE MERRITT'
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
  stationAbrevCookieValue: string = '';
  city1CookieValue: string = '';
  city2CookieValue: string = '';

  stationValue: string = '';
  city1Value: string = '';
  city2Value: string = '';

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
    //We should have some checks on the inputs:
    this.checkStationInput(this.stationValue);

    //Chek input, TBD:
    this.city1CookieValue = this.city1CookieValue;
    this.city2CookieValue = this.city2CookieValue;

    this.setCookie('station', this.stationCookieValue, 7);
    this.setCookie('stationAbrev', this.stationAbrevCookieValue, 7);
    this.setCookie('city1', this.city1CookieValue, 7);
    this.setCookie('city2', this.city2CookieValue, 7);

    alert(`We saved: Station -  ${this.stationCookieValue}, City 1: ${this.city1CookieValue}, City 2: ${this.city2CookieValue}`);
  }

  onGetCookie(): void {
    const cookieValue = this.getCookie('station');
    this.cookieValueMessage = cookieValue ? `Station -  ${this.stationCookieValue}, City 1: ${this.city1CookieValue}, City 2: ${this.city2CookieValue}` : 'Cookie not found';
  }

  checkStationInput(station: string): void {
    //If is a valid station, return the abrev:
    if(station.toUpperCase() in stationAbbreviations){
      console.log('Abrev:', stationAbbreviations[station.toUpperCase()]);
      this.stationAbrevCookieValue = stationAbbreviations[station.toUpperCase()];
      this.stationCookieValue = station;
    }
    else{
      //Else, send an alert, set a default
      alert("Station not found, unable to change the station");
      //if the first input is a bad input and we have no cookie saved, use the default values
      if(this.cookieService.get('stationAbrev') == '' && this.cookieService.get('station') == ''){
        this.stationCookieValue = DEFAULTSTATION;
        this.stationAbrevCookieValue = stationAbbreviations[DEFAULTSTATION]
      } else {
        this.stationAbrevCookieValue = this.cookieService.get('stationAbrev');
        this.stationCookieValue = this.cookieService.get('station');
      }
    }
  }
}
