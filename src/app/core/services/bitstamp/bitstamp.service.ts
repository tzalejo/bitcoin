import { Injectable } from '@angular/core';
import { environment } from '@environments/environment';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { AuthService } from '../interceptor/auth.service';

@Injectable({
  providedIn: 'root'
})
export class BitstampService {
  // tslint:disable-next-line: variable-name
  url_api_Bitstamp = environment.url_api_bitstamp;
  header = this.authService.httpOptions;
  transactions = 'https://www.bitstamp.net/api/v2/transactions/'
  constructor(
    private http: HttpClient,
    private authService: AuthService
  ) {}

  // getBitcoin(): Observable<any> {
  //   // return this.http.get<any>(`https://www.bitstamp.net/api/ticker/`, httpOptions);
  //   return this.http.get<any>(`${this.url_api_Bitstamp}/btcusd`, this.header);
  // }
  // getEthereum(): Observable<any> {
  //   return this.http.get<any>(`${this.url_api_Bitstamp}/ethusd`, this.header);
  // }
  // getLitecoin(): Observable<any> {
  //   return this.http.get<any>(`${this.url_api_Bitstamp}/ltcusd`, this.header);
  // }

  // datos de la evolucion de la moneda con el formato:
  // [{
  //     "date": "1586120810",
  //     "tid": "110046553",
  //     "price": "6754.05",
  //     "type": "0",
  //     "amount": "0.08984875"
  // }]....
  getBitcoinTransactions(): Observable<any> {
    return this.http.get(`${this.transactions}/btcusd?day`);
  }
  getEthereumTransactions(): Observable<any> {
    return this.http.get(`${this.transactions}/ethusd?day`);
  }
  getLitecoinTransactions(): Observable<any> {
    return this.http.get(`${this.transactions}/ltcusd?day`);
  }
}
