// el token PLATFORM_ID para verificar si la plataforma actual es navegador o servidor.
import { Component, PLATFORM_ID, OnInit, Inject } from '@angular/core';
import { AuthService } from '@core/services/interceptor/auth.service';
import { User } from '@core/interface/user';
import { environment } from '@environments/environment';
// Aplicamos SSR(Server-Side Rendering) para renderizar del lado del servidor pero algunos
// elementos si o si tiene q realizarse del lado del cliente para ello esta variable
// que pregunta si estoy del lado del cliente (isPlatformServer verifica si estas del lado del servidor)
import { isPlatformBrowser } from '@angular/common';

declare let particlesJS: any;
@Component({
  selector: 'app-dashoard',
  templateUrl: './dashoard.component.html',
  styleUrls: ['./dashoard.component.css']
})
export class DashoardComponent implements OnInit {
  currentUser: User;
  constructor(
    // tslint:disable-next-line: ban-types
    @Inject(PLATFORM_ID) private platformId: Object,
    private authService: AuthService,
    ) {
  }
  ngOnInit() {
    this.currentUser = this.authService.currentUserValue;
    // this.invokeParticles();
  }
  // public invokeParticles(): void {
    // SSR() - Pregunto si estoy del lado del navegador para que renderize de ese lado
    // if (isPlatformBrowser(this.platformId)) {
    //   // Client only code.
    //   // tslint:disable-next-line: only-arrow-functions
    //   particlesJS('particles-js', environment.ParticlesConfig, () => console.log('se ejecuto particles-js') );
    // }
  // }

  public estaLogueado() {
    // console.log(this.authService.currentUserValue);
    return (this.authService.currentUserValue ? false : true);
  }
}
