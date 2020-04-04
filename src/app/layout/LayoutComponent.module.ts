import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MaterialModule } from '@material/material.module';
import { LayoutComponent } from './components/layout.component';
import { RouterModule } from '@angular/router';
@NgModule({
  declarations: [LayoutComponent],
  imports: [
    CommonModule,
    RouterModule,
    MaterialModule,
  ]
})
export class LayoutComponentModule {
}
