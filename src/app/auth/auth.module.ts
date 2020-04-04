import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
// Para formulario
import { ReactiveFormsModule } from '@angular/forms';
// material

// routing de auth
import { AuthRoutingModule } from './auth-routing.module';
// componentes
import { RegisterComponent } from './components/register/register.component';
import { LoginComponent } from './components/login/login.component';
import { DashoardComponent } from './components/dashoard/dashoard.component';
import { MaterialModule } from '@material/material.module';
// import { SharedModule } from '../shared/shared.module';


@NgModule({
  declarations: [RegisterComponent, LoginComponent, DashoardComponent],
  imports: [
    CommonModule,
    AuthRoutingModule,
    MaterialModule,
    ReactiveFormsModule,
    // SharedModule
  ]
})
export class AuthModule { }
