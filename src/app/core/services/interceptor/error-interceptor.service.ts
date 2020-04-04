import { Injectable } from '@angular/core';
import { HttpInterceptor, HttpRequest, HttpHandler, HttpEvent, HttpErrorResponse } from '@angular/common/http';
import { Observable, throwError } from 'rxjs';
import { catchError } from 'rxjs/operators';
import { AuthService } from './auth.service';
// cartel
import Swal from 'sweetalert2';
import { Router } from '@angular/router';

@Injectable({
  providedIn: 'root'
})
export class ErrorInterceptorService implements HttpInterceptor{
  // para el manejo de carteles..
  constructor(
    private authService: AuthService,
    private router: Router,
  ) { }
  intercept(req: HttpRequest<any>, next: HttpHandler): Observable<HttpEvent<any>> {

    return next.handle(req).pipe(catchError((error: HttpErrorResponse) => {
      // console.log('ejecuto error-interceptor');
      if (error instanceof HttpErrorResponse && error.status !== 400 ) {
        // error server-side
        console.log('Error: SERVER-Side', error);
        // pregutno si es un error 0 el cual el servidor
        let msgTitle = '';
        let msgText = '';
        if (error.status === 401 || error.status === 403) {
          msgTitle = `Error Autorización.`;
          msgText = ` Status: ${error.status} - ` + (error.status === 401? 'Usuario y/o Contraseña es invalido, verifique por favor.': 'Solicitud NO autorizada.');
        } else if (error.status === 0 || error.status === 405 ) { // 405 error en la url
          msgTitle = `Unreachable.`;
          msgText = ` Status: ${error.status} - No se pude comunicar con el servidor.`;
        } else if ( error.status === 500) {
          msgTitle = `Error Servidor .`;
          msgText = ` Status: ${error.status} - Error en servidor interno.`;
        } else {
          msgTitle = `Error.`;
          msgText = ` Status: ${error.status} - ${error.message}` ;
        }

        Swal.fire({
          position: 'top-end',
          icon: 'error',
          title: msgTitle,
          showConfirmButton: true,
          text: msgText,
          // timer: 3500,
        });
        // como hubo un error en el servidor, mando a loguear de vuelta..
        this.authService.logout();
        this.router.navigate(['auth/login']);
        return throwError('Error servidor');
      } else {
        // error client-side
        console.log('Error: CLIENT-Side', error);
        // Swal.fire({
        //   position: 'top-end',
        //   icon: 'error',
        //   title: `Error Cliente`,
        //   showConfirmButton: false,
        //   text: 'Error',
        //   timer: 3500
        // });
        return throwError(error);
      }
    }));
  }
}