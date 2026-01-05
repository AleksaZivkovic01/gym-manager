import { HttpInterceptorFn } from '@angular/common/http';
import { inject } from '@angular/core';
import { Store } from '@ngrx/store';
import { selectAuthToken } from '../../store/auth/auth.selector';
import { take } from 'rxjs/operators';

export const authInterceptor: HttpInterceptorFn = (req, next) => {
  const store = inject(Store);
  let token: string | null = null;

  
  store.select(selectAuthToken)
    .pipe(take(1))
    .subscribe(t => token = t)
    .unsubscribe();

  if (token) {
    req = req.clone({
      setHeaders: {
        Authorization: `Bearer ${token}`,
      },
    });
  }

  return next(req);
};

