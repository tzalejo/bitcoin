import { Component, OnInit, PLATFORM_ID, Inject } from '@angular/core';
import { FormGroup, FormBuilder, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { User } from '@core/interface/user';
import { AuthService } from '@core/services/interceptor/auth.service';
import { environment } from '@environments/environment';
import { MustMatch } from './password.validation';

// import { UserService } from './../../../core/services/user/user.service';
import { first } from 'rxjs/operators';
// Para los mensajes
import Swal from 'sweetalert2';
import { isPlatformBrowser } from '@angular/common';
declare let particlesJS: any;
@Component({
  selector: 'app-register',
  templateUrl: './register.component.html',
  styleUrls: ['./register.component.css']
})
export class RegisterComponent implements OnInit {
  formularioRegistro: FormGroup;
  nuevoUsuario: User = null;
  // bandera para saber si las passwords son correctas..
  submitted = false;
  // bandera para saber si se envio el registro..
  enviado = false;
  // para el manejo de carteles..
  miToast = Swal.mixin({
    toast: true,
    position: 'top-end',
    showConfirmButton: false,
    timer: 3500
  });
  constructor(
    // tslint:disable-next-line: ban-types
    @Inject(PLATFORM_ID) private platformId: Object,
    private router: Router,
    private formBuilder: FormBuilder,
    private authService: AuthService,
    // private userService: UserService,
  ) {
     // redirecciono al home si estoy logueado
     if (authService.currentUserValue) {
       this.router.navigate(['home']);
     }
     // valido el formulario..
     this.buildForms();
  }

  ngOnInit() {
    // this.invokeParticles();
  }

  get f() { return this.formularioRegistro.controls; }

  // evento que lanza el formulario
  onSubmit() {
    console.log(this.formularioRegistro);
    // verifico que los valores sean validos..
    if (this.formularioRegistro.invalid) {
      return;
    }
    this.enviado = true;
    const datos = {
      apellido: this.formularioRegistro.value.apellido,
      email: this.formularioRegistro.value.email,
      name: this.formularioRegistro.value.name,
      password: this.formularioRegistro.value.password,
    };

    this.authService.register(datos)
      .pipe(first())
      .subscribe(
        data => {
          this.miToast.fire({
            icon: 'success',
            title: `Registración correcta`
          });
          console.log(data);
          this.router.navigate(['home']);
          Swal.fire({
            position: 'top-end',
            icon: 'success',
            title: ` Registración correcta ${data.name}` ,
            showConfirmButton: false,
            timer: 3500
          });
        }
      );
  }

  private buildForms() {
    // validamos los datos del formulario, obtengo los valor y los valido.
    this.formularioRegistro = this.formBuilder.group({
      name: [null, Validators.required],
      apellido: [null, Validators.required],
      email:      [null, [Validators.required, Validators.email]],
      password:   [null, [Validators.required, Validators.minLength(5)]],
      confirmacionPassword:   [null, Validators.required]
    }, {
      validator: MustMatch('password', 'confirmacionPassword')
    });
  }
  // public invokeParticles(): void {
  //   // SSR() - Pregunto si estoy del lado del navegador para que renderize de ese lado
  //   if (isPlatformBrowser(this.platformId)) {
  //     // Client only code.
  //     particlesJS('particles-js', environment.ParticlesConfig, () => console.log('se ejecto particles-js'));
  //   }
  // }
}
