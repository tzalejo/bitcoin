import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';

import { environment } from '@environments/environment';
import { AuthService } from '../interceptor/auth.service';
import { Observable } from 'rxjs';
import { Formulario } from '@core/interface/formulario';


@Injectable({
  providedIn: 'root'
})
export class FormularioService {
  url = `${environment.url_api}/formulario`;
  header = this.authService.httpOptions;
  constructor(
    private httpCliente: HttpClient,
    private authService: AuthService
  ) {}

  getFormularios(): Observable<Formulario[]> {
    return this.httpCliente.get<Formulario[]>(`${this.url}`, this.header);
  }

  crearFormulario(formulario: Formulario): Observable<any> {
    return this.httpCliente.post(`${this.url}/crear`, formulario, this.header);
  }

  actualizarFormulario(formulario): Observable<any> {
    return this.httpCliente.put(`${this.url}/modificar/${formulario.id}`, formulario, this.header);
  }

  eliminarFormulario(formulario): Observable<any> {
    return this.httpCliente.delete(`${this.url}/borrar/${formulario.id}`, this.header);
  }
}
