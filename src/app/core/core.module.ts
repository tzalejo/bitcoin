import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { HTTP_INTERCEPTORS } from '@angular/common/http';
// interceptor
// servicio para autenticacion de los usuarios
import { AuthService } from './services/interceptor/auth.service';
// servicio interceptor para agregar en los headers token
import { AuthInterceptorService } from './services/interceptor/auth-interceptor.service';
// servicio interceptor para obtener los errores
import { ErrorInterceptorService } from './services/interceptor/error-interceptor.service';
// servicio
import { CoinmarketcapService } from './services/coinmarketcap/coinmarketcap.service';
import { BitstampService } from './services/bitstamp/bitstamp.service';
import { CoinmonitorService } from './services/coinmonitor/coinmonitor.service';
import { ProveService } from './services/prove/prove.service';
import { ClienteService } from './services/cliente/cliente.service';


@NgModule({
  declarations: [],
  imports: [
    CommonModule
  ],
  providers: [
    // api_backend
    AuthService,
    ClienteService,
    ProveService,
    // api web
    BitstampService,
    CoinmarketcapService,
    CoinmonitorService,
    [{
      provide: HTTP_INTERCEPTORS,
      useClass: AuthInterceptorService,
      multi: true
    },
    {
      provide: HTTP_INTERCEPTORS,
      useClass: ErrorInterceptorService,
      multi: true
    }
  ]

  ]
})
export class CoreModule { }
