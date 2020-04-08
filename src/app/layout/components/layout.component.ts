import { Component } from '@angular/core';
import { Router } from '@angular/router';
import { map, shareReplay } from 'rxjs/operators';
import { BreakpointObserver, Breakpoints } from '@angular/cdk/layout';
import { Observable } from 'rxjs';
import { AuthService } from '@core/services/interceptor/auth.service';
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

  constructor(
    private breakpointObserver: BreakpointObserver,
    private authSevice: AuthService,
    private router: Router,
  ) {}

  logout() {
    this.authSevice.logout();
    this.router.navigate(['']);
  }

}
