import { Routes } from '@angular/router';
import { FeModuleComponent } from './fe-module.component';

export const FE_MODULE_ROUTES: Routes = [
  {
    path: '',
    component: FeModuleComponent,
    children: [
      {
        path: '',
        redirectTo: 'dashboard',
        pathMatch: 'full'
      },
      {
        path: 'dashboard',
        loadComponent: () => import('./pages/fe-dashboard/fe-dashboard.component').then(c => c.FeDashboardComponent)
      },
      {
        path: 'tasks',
        loadComponent: () => import('./pages/fe-tasks/fe-tasks.component').then(c => c.FeTasksComponent)
      },
      {
        path: 'projects',
        loadComponent: () => import('./pages/fe-projects/fe-projects.component').then(c => c.FeProjectsComponent)
      },
      {
        path: 'team',
        loadComponent: () => import('./pages/fe-team/fe-team.component').then(c => c.FeTeamComponent)
      },
      {
        path: 'settings',
        loadComponent: () => import('./pages/fe-settings/fe-settings.component').then(c => c.FeSettingsComponent)
      }
    ]
  }
];
