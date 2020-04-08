import { Injectable } from '@angular/core';
import { HttpInterceptor, HttpRequest, HttpHandler, HttpEvent } from '@angular/common/http';
import { Observable, throwError} from 'rxjs';
import { AuthService } from './auth.service';
import { Router } from '@angular/router';
import { catchError } from 'rxjs/operators';
import { environment } from '@environments/environment';
@Injectable({
  providedIn: 'root'
})
export class AuthInterceptorService implements HttpInterceptor {
  constructor(
    private authService: AuthService,
    private router: Router,
  ) {}
  intercept(req: HttpRequest<any>, next: HttpHandler): Observable<HttpEvent<any>> {
    // Los interceptors inspecciona/modifica las peticiones (enpoints, servicios, o como lo quieras llamar)
    // por ejemplo nuestro interceptor agrega la cabecera ‘Authorization’
    const user = this.authService.currentUserValue;
    const api = environment.url_api;
    // Verifico si el hay token y si verifico que el api sea solo backend con
    // environment.url_api.includes(req.url) para agregar el token solo al api del backend
    if (user && user.token && req.url.includes(api)) {
      // agrego el token
      req = req.clone({ setHeaders: { Authorization: `Bearer ${user.token}` } });
    }
    return next.handle(req).pipe(
      catchError(error => {
        // si retorna un error 401.. lo redirecciono al login..
        if (error.status === 401) {
          this.authService.logout();
          this.router.navigate(['']);
        }
        return throwError(error);
      })
    );
  }
}
