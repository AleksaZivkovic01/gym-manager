import { CanActivateFn, Router } from '@angular/router';
import { inject } from '@angular/core';
import { Store } from '@ngrx/store';
import { map, take, switchMap } from 'rxjs/operators';
import { of } from 'rxjs';
import { selectCurrentUser, selectIsAuthenticated } from '../../store/auth/auth.selector';
import { UserRole } from '../../shared/models/user.model';

export const roleGuard: CanActivateFn = (route, state) => {
  const store = inject(Store);
  const router = inject(Router);

  const allowedRoles = route.data?.['roles'] as UserRole[] | undefined;

  // ako ruta nema role
  if (!allowedRoles || allowedRoles.length === 0) {
    return true;
  }

  return store.select(selectCurrentUser).pipe(
    take(1),
    switchMap((currentUser) => {
      if (currentUser && allowedRoles.includes(currentUser.role)) {
        return of(true);
      }

      
      return store.select(selectIsAuthenticated).pipe(
        take(1),
        map((isAuthenticated) => {
          if (isAuthenticated) {
            router.navigate(['/']);
          } else {
            router.navigate(['/login'], { queryParams: { redirect: state.url } }); 
          }
          return false;
        })
      );
    })
  );
};


