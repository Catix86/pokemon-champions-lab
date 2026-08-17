import { PokemonScoreBreakdown } from './pokemon-evaluation.models';

/** Floor di calibrazione per i profili meta verificati. La somma resta sempre 0-100. */
export const CURATED_SCORE_FLOORS: Readonly<Record<string, PokemonScoreBreakdown>> = {
  garchomp:    { stats: 19, ability: 17, movepool: 18, typing: 18, meta: 20 },
  kingambit:   { stats: 19, ability: 19, movepool: 18, typing: 18, meta: 20 },
  incineroar:  { stats: 16, ability: 20, movepool: 19, typing: 15, meta: 20 },
  gholdengo:   { stats: 18, ability: 20, movepool: 19, typing: 18, meta: 20 },
  archaludon:  { stats: 18, ability: 18, movepool: 18, typing: 18, meta: 18 },
  whimsicott:  { stats: 16, ability: 20, movepool: 20, typing: 16, meta: 19 },
  sinistcha:   { stats: 16, ability: 17, movepool: 20, typing: 17, meta: 19 },
  basculegion: { stats: 18, ability: 17, movepool: 17, typing: 17, meta: 19 },
  sneasler:    { stats: 18, ability: 16, movepool: 18, typing: 15, meta: 18 },
  pelipper:    { stats: 14, ability: 20, movepool: 18, typing: 15, meta: 18 },
  farigiraf:   { stats: 16, ability: 18, movepool: 19, typing: 16, meta: 18 },
  dragonite:   { stats: 18, ability: 18, movepool: 17, typing: 16, meta: 16 },
  aegislash:   { stats: 18, ability: 18, movepool: 18, typing: 18, meta: 16 },
  glimmora:    { stats: 15, ability: 15, movepool: 17, typing: 14, meta: 14 },
  garbodor:    { stats: 8, ability: 7, movepool: 8, typing: 7, meta: 4 },
  avalugg:     { stats: 9, ability: 5, movepool: 7, typing: 4, meta: 4 },
  crabominable:{ stats: 8, ability: 5, movepool: 7, typing: 4, meta: 3 },
  watchog:     { stats: 6, ability: 5, movepool: 6, typing: 4, meta: 4 },
  ariados:     { stats: 6, ability: 5, movepool: 7, typing: 4, meta: 3 },
  castform:    { stats: 5, ability: 4, movepool: 6, typing: 3, meta: 2 },
};

/** Segnale di presenza nel metagame, usato soltanto nella quinta categoria. */
export const META_VIABILITY: Readonly<Record<string, number>> = {
  garchomp:20, kingambit:20, incineroar:20, gholdengo:19, sinistcha:19,
  basculegion:19, whimsicott:19, sneasler:18, pelipper:18, archaludon:18,
  farigiraf:18, sylveon:17, charizard:17, swampert:17, grimmsnarl:16,
  metagross:16, dragonite:16, aegislash:16, glimmora:14,
};
