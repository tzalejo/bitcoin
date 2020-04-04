import { Injectable } from '@angular/core';
import { HttpInterceptor, HttpRequest, HttpHandler, HttpEvent } from '@angular/common/http';
import { Observable, throwError} from 'rxjs';
import { AuthService } from './auth.service';
import { Router } from '@angular/router';
import { catchError } from 'rxjs/operators';
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
    console.log('authinterceptor', user);
    // verifico si el hay token
    if (user && user.token) {
      req = req.clone({ setHeaders: { Authorization: `Bearer ${user.token}` } });
    // }else{
    //   this.router.navigate(['login']);
    }
    return next.handle(req).pipe(
      catchError(error => {
        // si retorna un error 401.. lo redirecciono al login..
        if (error.status === 401) {
          console.log('en auth-interceptor');
          this.authService.logout();
          this.router.navigate(['auth/login']);
        }
        return throwError(error);
      })
    );
  }
}