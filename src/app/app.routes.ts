import { Routes } from '@angular/router';
export const routes: Routes = [
  { path: '', pathMatch: 'full', redirectTo: 'pokedex' },
  { path: 'pokedex', loadComponent: () => import('./features/pokedex/pokedex.component').then(m => m.PokedexComponent), title: 'Pokédex' },
  { path: 'team-builder', loadComponent: () => import('./features/team-builder/team-builder.component').then(m => m.TeamBuilderComponent), title: 'Costruisci Squadra' },
  { path: 'saved-teams', loadComponent: () => import('./features/saved-teams/saved-teams.component').then(m => m.SavedTeamsComponent), title: 'Squadre Salvate' },
  { path: 'recruitment', loadComponent: () => import('./features/recruitment/recruitment.component').then(m => m.RecruitmentComponent), title: 'Ingaggia' },
  { path: '**', redirectTo: 'pokedex' }
];