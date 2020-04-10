// El token PLATFORM_ID para verificar si la plataforma actual es navegador o servidor.
import { Injectable, PLATFORM_ID, Inject } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
// import { environment } from '@environments/environment';
import { map } from 'rxjs/operators';
import { BehaviorSubject } from 'rxjs';
// import { User } from '../../interface/user';

// Aplicamos SSR(Server-Side Rendering) para renderizar del lado del servidor pero algunos
// elementos si o si tiene q realizarse del lado del cliente para ello esta variable
// que pregunta si estoy del lado del cliente (isPlatformServer verifica si estas del lado del servidor)
import { isPlatformBrowser } from '@angular/common';
import { environment } from '@environments/environment';
import { User } from '../../interface/user';
@Injectable({
  providedIn: 'root'
})
export class AuthService {
  private currentUserSubject: BehaviorSubject<any>;
  constructor(
    private http: HttpClient,
    // SSR() - Necesitamos para aplicar excepciones si estoy del lado del navegador.
    // tslint:disable-next-line: ban-types
    @Inject(PLATFORM_ID) private platformId: Object
  ) {
    // SSR() - Pregunto si estoy del lado del navegador para que renderize de ese lado
    if (isPlatformBrowser(this.platformId)) {
      // Client only code.
      this.currentUserSubject = new BehaviorSubject<User>(JSON.parse(localStorage.getItem('currentUser')));
    }
  }

  login(email: string, password: string) {
    // console.log(email, password)
    const datos = { email, password };
    return this.http.post<any>(`${environment.url_api}/auth/login`, datos)
    .pipe(
      map(user => {
          // inicio de sesion exitosa si hay un token
          if (user && user.token) {
            // SSR()
            if (isPlatformBrowser(this.platformId)) {
              // almaceno los detalles del usuario y el token jwt en el localstorage para mantener al usuario conectado
              localStorage.setItem('currentUser', JSON.stringify(user));
              this.currentUserSubject.next(user);
            }
          }
          // console.log('mi usuario ', user);
          return user;
        })
      );
  }
  logout() {
    if (isPlatformBrowser(this.platformId)) {
      localStorage.removeItem('currentUser');
      this.currentUserSubject.next(null);
    }
  }
  // registramos un usuario (secretaria)
  register(user: User) {
    return this.http.post(`${environment.url_api}/auth/signup`, user, this.httpOptions);
  }

  public get currentUserValue(): User {
    if (isPlatformBrowser(this.platformId)) {
      // Client only code.
      return this.currentUserSubject.value;
    }
  }

  public get httpOptions() {
    const httpOptions = {
      headers: new HttpHeaders({
        'Content-Type': 'application/json',
      })
    };
    return httpOptions;
  }
}
