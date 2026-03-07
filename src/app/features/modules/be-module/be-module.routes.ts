import { Routes } from '@angular/router';
import { BeModuleComponent } from './be-module.component';

export const BE_MODULE_ROUTES: Routes = [
  {
    path: '',
    component: BeModuleComponent,
    data: { moduleId: 'be' },
    children: [
      { path: '', redirectTo: 'dashboard', pathMatch: 'full' },
      {
        path: 'dashboard',
        loadComponent: () => import('./pages/be-dashboard/be-dashboard.component').then(c => c.BeDashboardComponent)
      },
      {
        path: 'apis',
        loadComponent: () => import('./pages/be-apis/be-apis.component').then(c => c.BeApisComponent)
      },
      {
        path: 'database',
        loadComponent: () => import('./pages/be-database/be-database.component').then(c => c.BeDatabaseComponent)
      },
      {
        path: 'services',
        loadComponent: () => import('./pages/be-services/be-services.component').then(c => c.BeServicesComponent)
      },
      {
        path: 'logs',
        loadComponent: () => import('./pages/be-logs/be-logs.component').then(c => c.BeLogsComponent)
      },
      {
        path: 'settings',
        loadComponent: () => import('./pages/be-settings/be-settings.component').then(c => c.BeSettingsComponent)
      }
    ]
  }
];
