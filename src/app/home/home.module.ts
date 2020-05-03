import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { HomeRoutingModule } from './home-routing.module';
import { FormsModule } from '@angular/forms';
import { ReactiveFormsModule } from '@angular/forms';
// material
import { MaterialModule } from '@material/material.module';
// componentes
import { ProveComponent } from './components/prove/prove.component';
import { HomeComponent } from './components/home/home.component';
import { ClienteComponent } from './components/cliente/cliente.component';
import { HighchartsChartModule } from 'highcharts-angular';
import { FiltrosComponent } from './components/filtros/filtros.component';
import { SeleccionClienteComponent } from './components/_seleccion-cliente/seleccion-cliente.component';
@NgModule({
  declarations: [
    HomeComponent,
    ProveComponent,
    ClienteComponent,
    FiltrosComponent,
    SeleccionClienteComponent,
  ],
  imports: [
    CommonModule,
    MaterialModule,
    HomeRoutingModule,
    HighchartsChartModule,
    ReactiveFormsModule,
    FormsModule
  ]
})
export class HomeModule { }
