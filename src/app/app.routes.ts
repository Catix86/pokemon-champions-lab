import { Routes } from '@angular/router';
import { authGuard, guestGuard } from './core/auth/auth.guard';
export const routes: Routes = [
  { path:'login', canActivate:[guestGuard], loadComponent:()=>import('./features/auth/login.component').then(m=>m.LoginComponent), title:'Accesso' },
  { path:'', pathMatch:'full', redirectTo:'pokedex' },
  { path:'pokedex', canActivate:[authGuard], loadComponent:()=>import('./features/pokedex/pokedex.component').then(m=>m.PokedexComponent), title:'Pokédex' },
  { path:'team-builder', canActivate:[authGuard], loadComponent:()=>import('./features/team-builder/team-builder.component').then(m=>m.TeamBuilderComponent), title:'Costruisci Squadra' },
  { path:'saved-teams', canActivate:[authGuard], loadComponent:()=>import('./features/saved-teams/saved-teams.component').then(m=>m.SavedTeamsComponent), title:'Squadre Salvate' },
  { path:'recruitment', canActivate:[authGuard], loadComponent:()=>import('./features/recruitment/recruitment.component').then(m=>m.RecruitmentComponent), title:'Ingaggia' },
  { path:'**', redirectTo:'pokedex' },
];
