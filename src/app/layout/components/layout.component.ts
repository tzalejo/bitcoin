import { Component } from '@angular/core';
import { Router } from '@angular/router';
import { AuthService } from '@core/services/interceptor/auth.service';
import { User } from '@core/interface/user';
@Component({
  selector: 'app-layout',
  templateUrl: './layout.component.html',
  styleUrls: ['./layout.component.scss']
})
export class LayoutComponent {
  // isHandset$: Observable<boolean> = this.breakpointObserver.observe(Breakpoints.Handset)
  //   .pipe(
  //     map(result => result.matches),
  //     shareReplay()
  //   );
  usuario: User;
  constructor(
    private authService: AuthService,
    private router: Router,
  ) {
    this.usuario = this.authService.currentUserValue;
  }

  logout() {
    this.authService.logout();
    this.router.navigate(['']);
  }

}
