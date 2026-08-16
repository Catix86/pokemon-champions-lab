export type PokemonType = 'Normale'|'Fuoco'|'Acqua'|'Elettro'|'Erba'|'Ghiaccio'|'Lotta'|'Veleno'|'Terra'|'Volante'|'Psico'|'Coleottero'|'Roccia'|'Spettro'|'Drago'|'Buio'|'Acciaio'|'Folletto';
export type Tier = 'S'|'A'|'B'|'C'|'D'|'E';
export type BattleFormat = 'singolo'|'doppio';
export type PokemonRole = 'Attaccante veloce'|'Supporto'|'Tank'|'Muro difensivo'|'Wallbreaker'|'Bilanciato'|'Offensivo'|'Supporto/Pivot';
export interface ScoreBreakdown { stats:number; ability:number; movepool:number; typing:number; meta:number; }
export interface Pokemon { id:number; key:string; name:string; sprite:string; types:PokemonType[]; role:PokemonRole; score:number; tier:Tier; scoreBreakdown:ScoreBreakdown; }
export interface MoveSet { name:string; type:PokemonType; }
export interface TeamMember { pokemon:Pokemon; nature:string; evs:string; moves:MoveSet[]; item:string; }
export interface Team { id?:string; name:string; format:BattleFormat; members:TeamMember[]; strategy:string; createdAt:number; }
export const tierFor=(score:number):Tier=>score>=90?'S':score>=80?'A':score>=70?'B':score>=60?'C':score>=50?'D':'E';