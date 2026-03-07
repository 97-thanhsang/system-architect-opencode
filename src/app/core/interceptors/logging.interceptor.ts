import { HttpInterceptorFn } from '@angular/common/http';
import { inject } from '@angular/core';
import { tap } from 'rxjs/operators';

export const loggingInterceptor: HttpInterceptorFn = (req, next) => {
  const startTime = Date.now();
  
  console.group(`🌐 HTTP ${req.method} ${req.url}`);
  console.log('Request Headers:', req.headers);
  console.log('Request Body:', req.body);

  return next(req).pipe(
    tap({
      next: (event) => {
        const duration = Date.now() - startTime;
        console.log(`✅ Response received in ${duration}ms`);
        console.log('Response:', event);
        console.groupEnd();
      },
      error: (error) => {
        const duration = Date.now() - startTime;
        console.log(`❌ Error after ${duration}ms`);
        console.log('Error:', error);
        console.groupEnd();
      }
    })
  );
};
