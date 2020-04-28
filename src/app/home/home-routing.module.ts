import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';
import { HomeComponent } from './components/home/home.component';
import { ProveComponent } from './components/prove/prove.component';
import { ClienteComponent } from './components/cliente/cliente.component';
import { FiltrosComponent } from './components/filtros/filtros.component';
import { MaterialModule } from '@material/material.module';

const routes: Routes = [
  {path: 'home', component: HomeComponent},
  {path: 'cliente', component: ClienteComponent},
  {path: 'prove', component: ProveComponent},
  {path: 'filtros', component: FiltrosComponent},
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [
    RouterModule,
    MaterialModule
  ]
})
export class HomeRoutingModule { }
