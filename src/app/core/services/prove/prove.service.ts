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


  getProveedores(): Observable<Proveedor[]> {
    return this.httpCliente.get<Proveedor[]>(`${this.url}`, this.header);
  }

  crearProveedor(proveedor): Observable<any> {
    return this.httpCliente.post(`${this.url}/crear`, proveedor, this.header);
  }

  modificarProveedor(proveedor): Observable<any> {
    return this.httpCliente.put(`${this.url}/modificar/${proveedor.id}`, proveedor, this.header);
  }

}
