import { inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';
import { filter, map, take } from 'rxjs';
import { AuthService } from './auth.service';
import { toObservable } from '@angular/core/rxjs-interop';

export const authGuard: CanActivateFn = (_route, state) => {
  const auth = inject(AuthService);
  const router = inject(Router);
  return toObservable(auth.initialized).pipe(
    filter(Boolean),
    take(1),
    map(() =>
      auth.authenticated()
        ? true
        : router.createUrlTree(['/login'], { queryParams: { returnUrl: state.url } }),
    ),
  );
};

export const guestGuard: CanActivateFn = () => {
  const auth = inject(AuthService);
  const router = inject(Router);
  return toObservable(auth.initialized).pipe(
    filter(Boolean),
    take(1),
    map(() => (auth.authenticated() ? router.createUrlTree(['/pokedex']) : true)),
  );
};
