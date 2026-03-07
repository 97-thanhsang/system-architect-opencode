import { Routes } from '@angular/router';
import { LoginTaigaComponent } from './components/login-taiga/login-taiga.component';
import { AuthCallbackComponent } from './components/auth-callback/auth-callback.component';

export const AUTH_ROUTES: Routes = [
  {
    path: '',
    redirectTo: 'login',
    pathMatch: 'full'
  },
  {
    path: 'login',
    component: LoginTaigaComponent
  },
  {
    path: 'callback',
    component: AuthCallbackComponent
  }
];
