import { Injectable } from '@angular/core';
import { environment } from '@environments/environment';
import { AuthService } from '../interceptor/auth.service';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
@Injectable({
  providedIn: 'root'
})
export class CoinmarketcapService {
  // tslint:disable-next-line: variable-name
  url_api_coinmarket = environment.url_api_coinmarketcap;
  header  = this.authService.httpOptions;
  keyConmarket = 'CMC_PRO_API_KEY=b5cbb9c6-e173-4ec2-ad59-dfb960066ac2';
  constructor(
    private authService: AuthService,
    private httpClient: HttpClient
  ) {
  }

  // historico  
  // https://pro-api.coinmarketcap.com/v1/cryptocurrency/quotes/historical 


  
  getCoinmarket(): Observable<any> {
    return this.httpClient.get(`${this.url_api_coinmarket}?${this.keyConmarket}`, this.header);
  }

}
