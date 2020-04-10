import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';

import { environment } from '@environments/environment';
import { AuthService } from '../interceptor/auth.service';
import { Observable } from 'rxjs';
import { Cliente } from '@core/interface/cliente';


@Injectable({
  providedIn: 'root'
})
export class ClienteService {
  url = `${environment.url_api}/cliente`;
  header = this.authService.httpOptions;
  constructor(
    private httpCliente: HttpClient,
    private authService: AuthService
  ) {}

  getClientes(): Observable<Cliente[]> {
    return this.httpCliente.get<Cliente[]>(`${this.url}`, this.header);
  }

}
