import { BattleFormat, MoveSet, Pokemon, PokemonRole, PokemonType, Team, TeamMember } from '../models';

export type PublicBattleFormat = 'single' | 'double';
export type TeamArchetype = 'tailwind-offense' | 'trick-room' | 'rain' | 'sun' | 'sand' | 'balance' | 'bulky-offense';
export type TeamRole = 'anchor' | 'physical-sweeper' | 'special-sweeper' | 'wallbreaker' | 'speed-control' | 'fake-out' | 'pivot' | 'tank' | 'weather-setter' | 'trick-room-setter' | 'utility';
export type MoveTag = 'protect' | 'fake-out' | 'pivot' | 'tailwind' | 'trick-room' | 'speed-control' | 'recovery' | 'setup' | 'spread' | 'priority' | 'status';

export interface CompetitiveMove extends MoveSet { readonly category: 'physical' | 'special' | 'status'; readonly power: number; readonly accuracy: number; readonly tags: readonly MoveTag[]; }
export interface CompetitiveProfile { readonly key: string; readonly speed: number; readonly attack: number; readonly specialAttack: number; readonly hp: number; readonly defense: number; readonly specialDefense: number; readonly ability: string; readonly megaEligible: boolean; readonly megaItem?: string; readonly roles: readonly TeamRole[]; readonly moves: readonly CompetitiveMove[]; }
export interface MetaThreat { readonly key: string; readonly types: readonly PokemonType[]; readonly weight: number; }
export interface BuiltSet { readonly member: TeamMember; readonly ability: string; readonly ivs: string; readonly roles: readonly TeamRole[]; readonly isMega: boolean; }
export interface CandidateAnalysis { readonly total: number; readonly defensive: number; readonly offensive: number; readonly roles: number; readonly archetype: number; readonly coverage: number; readonly violations: readonly string[]; }
export interface GeneratedTeam extends Team { readonly archetype: TeamArchetype; readonly anchorKey: string; readonly analysis: CandidateAnalysis; readonly lead: readonly [string, string]; }
export interface DraftContext { readonly box: readonly Pokemon[]; readonly format: BattleFormat; readonly archetype: TeamArchetype; readonly anchor: Pokemon; readonly teamSize: number; }
export interface ItemCandidate { readonly name: string; readonly score: number; }
export interface SelectedMoves { readonly moves: readonly [CompetitiveMove, CompetitiveMove, CompetitiveMove, CompetitiveMove]; readonly protectUsed: boolean; }
export const toInternalFormat = (format: PublicBattleFormat): BattleFormat => format === 'single' ? 'singolo' : 'doppio';
export const roleOf = (pokemon: Pokemon): PokemonRole => pokemon.role;

export type ProfileConfidence = 'curated' | 'generated' | 'limited';
export type TeamGenerationStatus = 'optimal' | 'valid-with-warnings' | 'fallback';
export type TeamWarningCode =
  | 'NO_FAKE_OUT'
  | 'NO_SPEED_CONTROL'
  | 'NO_PIVOT'
  | 'NO_TURN_ONE_CONTROL'
  | 'NO_MEGA'
  | 'INSUFFICIENT_META_COVERAGE'
  | 'DEFENSIVE_OVERLAP'
  | 'GENERATED_PROFILE'
  | 'LIMITED_PROFILE'
  | 'GENERATED_MOVESET'
  | 'ARCHETYPE_PARTIALLY_SATISFIED';
export interface TeamWarning { readonly code: TeamWarningCode; readonly severity: 'info' | 'warning'; readonly title: string; readonly message: string; readonly affectedPokemonKeys?: readonly string[]; readonly recommendation?: string; }
export interface ResolvedProfile { readonly profile: CompetitiveProfile; readonly confidence: ProfileConfidence; }
export interface WarningGeneratedTeam extends GeneratedTeam { readonly status: TeamGenerationStatus; readonly warnings: readonly TeamWarning[]; }
