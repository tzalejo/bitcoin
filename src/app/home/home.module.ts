import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { HomeRoutingModule } from './home-routing.module';
// material
import { MaterialModule } from '@material/material.module';
// componentes
import { ProveComponent } from './components/prove/prove.component';
import { HomeComponent } from './components/home/home.component';
import { ClienteComponent } from './components/cliente/cliente.component';
import { HighchartsChartModule } from 'highcharts-angular';
import { ReactiveFormsModule } from '@angular/forms';
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
    HighchartsChartModule,
    ReactiveFormsModule
  ]
})
export class HomeModule { }
