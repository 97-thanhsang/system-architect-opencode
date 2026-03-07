import { Routes } from '@angular/router';
import { BaModuleComponent } from './ba-module.component';

export const BA_MODULE_ROUTES: Routes = [
  {
    path: '',
    component: BaModuleComponent,
    data: { moduleId: 'ba' },
    children: [
      { path: '', redirectTo: 'dashboard', pathMatch: 'full' },
      {
        path: 'dashboard',
        loadComponent: () => import('./pages/ba-dashboard/ba-dashboard.component').then(c => c.BaDashboardComponent)
      },
      {
        path: 'requirements',
        loadComponent: () => import('./pages/ba-requirements/ba-requirements.component').then(c => c.BaRequirementsComponent)
      },
      {
        path: 'stories',
        loadComponent: () => import('./pages/ba-stories/ba-stories.component').then(c => c.BaStoriesComponent)
      },
      {
        path: 'diagrams',
        loadComponent: () => import('./pages/ba-diagrams/ba-diagrams.component').then(c => c.BaDiagramsComponent)
      },
      {
        path: 'documents',
        loadComponent: () => import('./pages/ba-documents/ba-documents.component').then(c => c.BaDocumentsComponent)
      },
      {
        path: 'settings',
        loadComponent: () => import('./pages/ba-settings/ba-settings.component').then(c => c.BaSettingsComponent)
      }
    ]
  }
];
