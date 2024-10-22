// el token PLATFORM_ID para verificar si la plataforma actual es navegador o servidor.
import { Component, PLATFORM_ID, OnInit, Inject } from '@angular/core';
import { Router } from '@angular/router';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { tap, map, catchError, first } from 'rxjs/operators';
import { Observable } from 'rxjs';
// servicios
import { AuthService } from 'src/app/core/services/interceptor/auth.service';
import Swal from 'sweetalert2';
import { MatTabGroup } from '@angular/material/tabs';
// import { environment } from 'src/environments/environment';
// declare let particlesJS: any;
@Component({
  selector: 'app-login',
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.css']
})
export class LoginComponent implements OnInit {
  form: FormGroup;
  respuesta$: Observable<any>;
  status: string;
  loading = false; // para spinner que esta cargado el botton login
  botonSiguiente = false;
  botonEnviarNuevaPass = false; // bandera para mostrar error de reset email
  submitted = false;
  hide = false;
  constructor(
    // tslint:disable-next-line: ban-types
    @Inject(PLATFORM_ID) private platformId: Object,
    private authService: AuthService,
    private router: Router,
    private fb: FormBuilder,
  ) {
    this.buildForms();
  }

  ngOnInit() {
    // this.invokeParticles();
  }

  onSubmit(event: Event) {
    this.submitted = true;
    if (this.form.valid) {
      const datos  = this.form.controls;
      this.loading = true;
      this.authService.login(datos.email.value, datos.password.value)
        .pipe(first())
        .subscribe(
          data => {
          // envio al home
          // console.log('login.components', data);
          this.router.navigate(['home']);
          Swal.fire({
            position: 'top-end',
            icon: 'success',
            title: ` Bienvendio ${data.name}` ,
            showConfirmButton: false,
            timer: 3500
          });
        },
          error => {
            // console.log(error);
            this.loading = false;
          }
        );
    } else {
      return;
    }
  }
  private buildForms() {
    this.form = this.fb.group({
      email: [null, [Validators.required, Validators.email]],
      password: [null, Validators.required]
    });
  }
  registro() {
    this.router.navigate(['register']);
  }
  // Me permite cambiar de Tab
  public ventanaEnvioPassword(tabGroup: MatTabGroup) {
    // desabilito mensaje de error de mail requerido
    this.botonEnviarNuevaPass = false;
    const tabCount = tabGroup._tabs.length;
    tabGroup.selectedIndex = (tabGroup.selectedIndex + 1) % tabCount;
  }

  enviarPassword(email) {
    if (email === '' || email === null ) {
      // habilito mensaje de error de mail requerido
      this.botonEnviarNuevaPass = true;
    } else {
      // desabilito el boton para que no clickean de mas..
      this.botonSiguiente = true;
      // llamo al servicio de reset password
      this.authService.resetPassword(email)
      .subscribe(
        data => {
          Swal.fire({
            position: 'top-end',
            icon: 'success',
            title: ` Password Reseteado` ,
            showConfirmButton: false,
            text: `Verifique su correo electronico.`,
            timer: 3500
          });
          this.router.navigate(['home']);
        },
        error => {
          console.log(this.botonSiguiente);
          this.botonSiguiente = false;
        }
      );
    }
  }

  // public invokeParticles(): void {
  //   // SSR() - Pregunto si estoy del lado del navegador para que renderize de ese lado
  //   if (isPlatformBrowser(this.platformId)) {
  //     // Client only code.
  //     particlesJS('particles-js', environment.ParticlesConfig, () => console.log('se ejecto particles-js'));
  //   }
  // }

}
