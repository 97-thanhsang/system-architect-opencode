import { Component } from '@angular/core';
import { DynamicLayoutComponent } from '../fe-module/components/layout/dynamic-layout.component';

@Component({
  selector: 'app-qc-module',
  standalone: true,
  imports: [DynamicLayoutComponent],
  template: `<app-dynamic-layout />`
})
export class QcModuleComponent {}
