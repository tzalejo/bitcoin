import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';

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

  getFormularios(): Observable<any[]> {
    return this.httpCliente.get<any[]>(`${this.url}`, this.header);
  }
  getFormulariosFilter(filter): Observable<any> {
    const compraMoneda: string = (filter.compra_moneda === null ||
                                  typeof filter.compra_moneda === 'undefined'  ) ? '' : filter.compra_moneda;
    const tipoCriptomoneda: string = (filter.tipo_criptomoneda === null ||
                                  typeof filter.tipo_criptomoneda === 'undefined'  ) ? '' : filter.tipo_criptomoneda;
    const fechaDesde: string = (filter.fechaDesde === null ||
                                  typeof filter.fechaDesde === 'undefined'  ) ? '' : filter.fechaDesde;
    const fechaHasta: string = (filter.fechaHasta === null ||
                                  typeof filter.fechaHasta === 'undefined'  ) ? '' : filter.fechaHasta;

    const estado: string = (filter.estado === null || typeof filter.estado === 'undefined'  ) ? '' : filter.estado;
    const cliente: string = (filter.cliente === null || typeof filter.cliente === 'undefined'  ) ? '' : filter.cliente;
    return this.httpCliente.get(`${this.url}?
            compra_moneda=${compraMoneda}&
            tipo_criptomoneda=${tipoCriptomoneda}&
            fechaDesde=${fechaDesde}&
            fechaHasta=${fechaHasta}&
            cliente=${cliente}&
            estado=${estado}`, this.header);
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
