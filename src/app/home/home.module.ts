import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { HomeRoutingModule } from './home-routing.module';
// material
import { MaterialModule } from '@material/material.module';
// componentes
import { ProveComponent } from './components/prove/prove.component';
import { HomeComponent } from './components/home/home.component';
import { ClienteComponent } from './components/cliente/cliente.component';

@NgModule({
  declarations: [
    HomeComponent,
    ProveComponent,
    ClienteComponent,
  ],
  imports: [
    CommonModule,
    MaterialModule,
    HomeRoutingModule,

  ]
})
export class HomeModule { }
