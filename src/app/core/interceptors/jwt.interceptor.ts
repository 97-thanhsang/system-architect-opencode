import { HttpInterceptorFn } from '@angular/common/http';
import { inject } from '@angular/core';
import { JiraAuthService } from '../auth/jira-auth.service';

/**
 * JWT Interceptor - Tự động thêm JWT token vào headers cho các API calls
 */
export const jwtInterceptor: HttpInterceptorFn = (req, next) => {
  const authService = inject(JiraAuthService);
  const token = authService.getToken();

  // Chỉ thêm token cho API calls (không phải static assets)
  if (token && req.url.startsWith('http')) {
    req = req.clone({
      setHeaders: {
        Authorization: `Bearer ${token}`
      }
    });
  }

  return next(req);
};
