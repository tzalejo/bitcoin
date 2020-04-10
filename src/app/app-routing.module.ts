import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';
import { LayoutComponent } from '@layout/components/layout.component';
import { AdminGuard } from '@guard/admin.guard';
import { QuicklinkStrategy } from 'ngx-quicklink';


const routes: Routes = [
  {path: '', redirectTo: 'auth', pathMatch: 'full'},
  {path: 'auth', loadChildren: () => import('./auth/auth.module').then(m => m.AuthModule)},
  {path: '', canActivate: [AdminGuard], component: LayoutComponent, children: [
    {path: '', loadChildren: () => import('./home/home.module').then(m => m.HomeModule) },
  ]},
];

@NgModule({
  imports: [RouterModule.forRoot(
    routes,
    {
      onSameUrlNavigation: 'reload', // configuro la strategy para recarga de la pagina..
      enableTracing: false,
      // tslint:disable-next-line: max-line-length
      preloadingStrategy: QuicklinkStrategy, // La estrategia Quicklink, lo que hace es que la precarga de los módulos, no es por parte del desarrollador, sino sea dinámico al comportamiento de la aplicación
      paramsInheritanceStrategy: 'always'
    }
  )],
  exports: [RouterModule]
})
export class AppRoutingModule { }
