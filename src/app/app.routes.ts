import { Routes } from '@angular/router';
import { authGuard } from './core/guards/auth.guard';
import { roleGuard } from './core/guards/role.guard';

export const routes: Routes = [
  {
    path: '',
    redirectTo: '/auth/login',
    pathMatch: 'full'
  },
  {
    path: 'auth',
    loadChildren: () => import('./features/auth/auth.routes').then(m => m.AUTH_ROUTES),
    data: { title: 'Authentication' }
  },
  {
    path: 'dashboard',
    canActivate: [authGuard],
    loadComponent: () => import('./features/dashboard/professional-dashboard.component').then(c => c.ProfessionalDashboardComponent),
    data: {
      title: 'Dashboard',
      breadcrumb: 'Home'
    }
  },
  {
    path: 'module/fe',
    canActivate: [authGuard, roleGuard(['FE', 'BE'])],
    loadChildren: () => import('./features/modules/fe-module/fe-module.routes').then(m => m.FE_MODULE_ROUTES),
    data: {
      title: 'Frontend Module',
      breadcrumb: 'Frontend',
      moduleId: 'fe',
      requiredRoles: ['FE', 'BE']
    }
  },
  {
    path: 'module/be',
    canActivate: [authGuard, roleGuard(['BE'])],
    loadChildren: () => import('./features/modules/be-module/be-module.routes').then(m => m.BE_MODULE_ROUTES),
    data: {
      title: 'Backend Module',
      breadcrumb: 'Backend',
      moduleId: 'be',
      requiredRoles: ['BE']
    }
  },
  {
    path: 'module/qc',
    canActivate: [authGuard, roleGuard(['QC', 'FE'])],
    loadChildren: () => import('./features/modules/qc-module/qc-module.routes').then(m => m.QC_MODULE_ROUTES),
    data: {
      title: 'Quality Control Module',
      breadcrumb: 'QC',
      moduleId: 'qc',
      requiredRoles: ['QC', 'FE']
    }
  },
  {
    path: 'module/ba',
    canActivate: [authGuard, roleGuard(['BA', 'FE', 'BE'])],
    loadChildren: () => import('./features/modules/ba-module/ba-module.routes').then(m => m.BA_MODULE_ROUTES),
    data: {
      title: 'Business Analyst Module',
      breadcrumb: 'BA',
      moduleId: 'ba',
      requiredRoles: ['BA', 'FE', 'BE']
    }
  },
  {
    path: 'profile',
    canActivate: [authGuard],
    loadComponent: () => import('./features/profile/profile.component').then(c => c.ProfileComponent),
    data: {
      title: 'User Profile',
      breadcrumb: 'Profile'
    }
  },
  {
    path: '**',
    loadComponent: () => import('./features/not-found/not-found.component').then(c => c.NotFoundComponent),
    data: { title: 'Page Not Found' }
  }
];
