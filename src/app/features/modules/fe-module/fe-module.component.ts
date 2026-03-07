import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterOutlet } from '@angular/router';
import { DynamicLayoutComponent } from './components/layout/dynamic-layout.component';
import { LayoutService } from './services/layout.service';

@Component({
  selector: 'app-fe-module',
  standalone: true,
  imports: [
    CommonModule,
    RouterOutlet,
    DynamicLayoutComponent
  ],
  template: `
    <app-dynamic-layout>
      <router-outlet />
    </app-dynamic-layout>
  `
})
export class FeModuleComponent {
  // Component serves as a wrapper for FE module with dynamic layout
}
