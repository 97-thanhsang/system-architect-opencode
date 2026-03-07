import { Routes } from '@angular/router';
import { QcModuleComponent } from './qc-module.component';

export const QC_MODULE_ROUTES: Routes = [
  {
    path: '',
    component: QcModuleComponent,
    data: { moduleId: 'qc' },
    children: [
      { path: '', redirectTo: 'dashboard', pathMatch: 'full' },
      {
        path: 'dashboard',
        loadComponent: () => import('./pages/qc-dashboard/qc-dashboard.component').then(c => c.QcDashboardComponent)
      },
      {
        path: 'testcases',
        loadComponent: () => import('./pages/qc-testcases/qc-testcases.component').then(c => c.QcTestcasesComponent)
      },
      {
        path: 'bugs',
        loadComponent: () => import('./pages/qc-bugs/qc-bugs.component').then(c => c.QcBugsComponent)
      },
      {
        path: 'testruns',
        loadComponent: () => import('./pages/qc-testruns/qc-testruns.component').then(c => c.QcTestrunsComponent)
      },
      {
        path: 'reports',
        loadComponent: () => import('./pages/qc-reports/qc-reports.component').then(c => c.QcReportsComponent)
      },
      {
        path: 'settings',
        loadComponent: () => import('./pages/qc-settings/qc-settings.component').then(c => c.QcSettingsComponent)
      }
    ]
  }
];
