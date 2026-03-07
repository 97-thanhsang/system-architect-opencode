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
    loadComponent: () => import('./features/dashboard/dashboard.component').then(c => c.DashboardComponent),
    data: { 
      title: 'Dashboard',
      breadcrumb: 'Home'
    }
  },
  {
    path: 'module/fe',
    canActivate: [authGuard, roleGuard(['FE', 'BE'])], // ✅ Role guard
    loadChildren: () => import('./features/modules/fe-module/fe-module.routes').then(m => m.FE_MODULE_ROUTES),
    data: { 
      title: 'Frontend Module',
      breadcrumb: 'Frontend',
      requiredRoles: ['FE', 'BE']
    }
  },
  {
    path: 'module/be',
    canActivate: [authGuard, roleGuard(['BE'])],
    loadComponent: () => import('./features/modules/fe-module/fe-module.component').then(c => c.FeModuleComponent),
    data: { 
      title: 'Backend Module',
      breadcrumb: 'Backend',
      requiredRoles: ['BE']
    }
  },
  {
    path: 'module/qc',
    canActivate: [authGuard, roleGuard(['QC', 'FE'])],
    loadComponent: () => import('./features/modules/fe-module/fe-module.component').then(c => c.FeModuleComponent),
    data: { 
      title: 'Quality Control Module',
      breadcrumb: 'QC',
      requiredRoles: ['QC', 'FE']
    }
  },
  {
    path: 'module/ba',
    canActivate: [authGuard, roleGuard(['BA', 'FE', 'BE'])],
    loadComponent: () => import('./features/modules/fe-module/fe-module.component').then(c => c.FeModuleComponent),
    data: { 
      title: 'Business Analyst Module',
      breadcrumb: 'BA',
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
