import { PokemonType } from '../models';

export interface IType { readonly name: PokemonType; }
export interface IAbility { readonly id: string; readonly name: string; readonly tags?: readonly string[]; }
export interface IMove { readonly id: string; readonly name: string; readonly type: PokemonType; readonly category: 'physical'|'special'|'status'; readonly power: number|null; readonly accuracy: number|null; readonly hasSevereDrawback?: boolean; readonly tags?: readonly string[]; }
export interface IBaseStats { readonly hp:number; readonly attack:number; readonly defense:number; readonly specialAttack:number; readonly specialDefense:number; readonly speed:number; }
export interface IPokemon { readonly id:number; readonly key:string; readonly name:string; readonly types:readonly PokemonType[]; readonly baseStats:IBaseStats; readonly abilities:readonly IAbility[]; readonly moves:readonly IMove[]; readonly megaEligible:boolean; readonly megaStats?:IBaseStats; readonly roleHint?:'physical'|'special'|'mixed'|'support'|'tank'; readonly dependencyTags?:readonly ('weather'|'trick-room'|'setup'|'ally-combo'|'self-sufficient')[]; }
export interface PokemonScoreBreakdown { readonly stats:number; readonly ability:number; readonly movepool:number; readonly typing:number; readonly meta:number; }
export interface PokemonEvaluation { readonly total:number; readonly breakdown:PokemonScoreBreakdown; readonly strengths:readonly string[]; readonly warnings:readonly string[]; }
export const SCORE_WEIGHTS={categoryMaximum:20,megaBonus:4,pivot:5,speedControl:5,turnControl:5,reliableStab:5} as const;
