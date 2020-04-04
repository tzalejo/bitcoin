import { Injectable } from '@angular/core';
import { CanActivate, ActivatedRouteSnapshot, RouterStateSnapshot, UrlTree, Router } from '@angular/router';
import { Observable } from 'rxjs';
import { AuthService } from '@core/services/interceptor/auth.service';

@Injectable({
  providedIn: 'root'
})
export class AdminGuard implements CanActivate {
  constructor(
    private router: Router,
    private authService: AuthService
  ) {}
  canActivate(
    next: ActivatedRouteSnapshot,
    state: RouterStateSnapshot): Observable<boolean | UrlTree> | Promise<boolean | UrlTree> | boolean | UrlTree {
      // veo si esta autenticado
      const currentUser = this.authService.currentUserValue;
      if (currentUser) {
        // esta autorizado, edevuelvo true
        return true;
      }
      // no esta logueado lo reenvio al login
      this.router.navigate(['/auth/login']);
      return false;
  }
}
