import { Injectable } from '@angular/core';
import { environment } from '@environments/environment';
import { HttpClient } from '@angular/common/http';
import { AuthService } from '../interceptor/auth.service';
import { Observable } from 'rxjs';
import { Proveedor } from '@core/interface/proveedor';

@Injectable({
  providedIn: 'root'
})
export class ProveService {

  url = `${environment.url_api}/proveedor`;
  header = this.authService.httpOptions;
  constructor(
    private httpCliente: HttpClient,
    private authService: AuthService
  ) {
  }


  getProve(): Observable<Proveedor[]> {
    return this.httpCliente.get<Proveedor[]>(`${this.url}`, this.header);
  }

}
