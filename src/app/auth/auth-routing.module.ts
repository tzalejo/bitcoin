import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';
// material module
import { MaterialModule } from '@material/material.module';
// componentes
import { LoginComponent } from './components/login/login.component';
import { RegisterComponent } from './components/register/register.component';
import { DashoardComponent } from './components/dashoard/dashoard.component';


const routes: Routes = [
  {path: '', component: DashoardComponent},
  {path: 'login', component: LoginComponent},
  {path: 'register', component: RegisterComponent},
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [
    RouterModule,
    MaterialModule
  ]
})
export class AuthRoutingModule { }
