import { Injectable, signal } from '@angular/core';
import { CHAMPIONS_ROSTER_KEYS } from './champions-roster';
import { KNOWLEDGE_BASE } from './knowledge-base';
import { Pokemon, PokemonRole, PokemonType, tierFor } from './models';

interface ApiDetail {
  id: number;
  name: string;
  sprites: { front_default: string | null };
  types: { slot: number; type: { name: string } }[];
  stats: { base_stat: number; stat: { name: string } }[];
}

const typeMap: Record<string, PokemonType> = {
  normal: 'Normale',
  fire: 'Fuoco',
  water: 'Acqua',
  electric: 'Elettro',
  grass: 'Erba',
  ice: 'Ghiaccio',
  fighting: 'Lotta',
  poison: 'Veleno',
  ground: 'Terra',
  flying: 'Volante',
  psychic: 'Psico',
  bug: 'Coleottero',
  rock: 'Roccia',
  ghost: 'Spettro',
  dragon: 'Drago',
  dark: 'Buio',
  steel: 'Acciaio',
  fairy: 'Folletto',
};

@Injectable({ providedIn: 'root' })
export class PokemonService {
  readonly catalog = signal<Pokemon[]>(KNOWLEDGE_BASE);
  readonly loading = signal(false);
  readonly error = signal('');

  async loadCatalog(): Promise<void> {
    if (this.catalog().length > 100) return;

    this.loading.set(true);
    this.error.set('');

    try {
      const curatedByKey = new Map(KNOWLEDGE_BASE.map((pokemon) => [pokemon.key, pokemon]));
      const requests = await Promise.allSettled(
        CHAMPIONS_ROSTER_KEYS.map(async (key) => {
          const response = await fetch(`https://pokeapi.co/api/v2/pokemon/${key}`);

          if (!response.ok) {
            throw new Error(`Pokemon non disponibile: ${key}`);
          }

          const detail = (await response.json()) as ApiDetail;
          return this.fromDetail(detail, curatedByKey.get(detail.name));
        }),
      );

      const catalog = requests
        .filter(
          (result): result is PromiseFulfilledResult<Pokemon> => result.status === 'fulfilled',
        )
        .map((result) => result.value)
        .sort((first, second) => first.id - second.id || first.name.localeCompare(second.name));

      this.catalog.set(catalog);

      const failedCount = requests.length - catalog.length;
      if (failedCount > 0) {
        this.error.set(
          `${failedCount} forme del roster non sono state risolte da PokeAPI. Riprova più tardi.`,
        );
      }
    } catch (error) {
      this.error.set(error instanceof Error ? error.message : 'Errore inatteso');
    } finally {
      this.loading.set(false);
    }
  }

  async hydratePage(_items: Pokemon[]): Promise<void> {
    // Il catalogo Champions viene già caricato con tutti i dettagli necessari.
    await Promise.resolve();
  }

  private fromDetail(detail: ApiDetail, curated?: Pokemon): Pokemon {
    const totalStats = detail.stats.reduce((sum, stat) => sum + stat.base_stat, 0);
    const speed = detail.stats.find((stat) => stat.stat.name === 'speed')?.base_stat ?? 70;
    const score = curated?.score ?? Math.max(20, Math.min(89, Math.round(totalStats / 7)));
    const role = curated?.role ?? this.estimateRole(totalStats, speed);

    return {
      id: detail.id,
      key: detail.name,
      name: this.formatName(detail.name),
      sprite:
        curated?.sprite ??
        detail.sprites.front_default ??
        `https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/${detail.id}.png`,
      types: detail.types
        .sort((first, second) => first.slot - second.slot)
        .map((entry) => typeMap[entry.type.name] ?? 'Normale'),
      role,
      score,
      tier: tierFor(score),
      scoreBreakdown: curated?.scoreBreakdown ?? this.scoreBreakdown(score),
    };
  }

  private estimateRole(totalStats: number, speed: number): PokemonRole {
    if (speed >= 105) return 'Attaccante veloce';
    if (totalStats >= 540) return 'Offensivo';
    if (totalStats >= 490) return 'Bilanciato';
    return 'Supporto';
  }

  private scoreBreakdown(score: number) {
    const base = Math.floor(score / 5);
    const remainder = score - base * 5;

    return {
      stats: base + (remainder > 0 ? 1 : 0),
      ability: base + (remainder > 1 ? 1 : 0),
      movepool: base + (remainder > 2 ? 1 : 0),
      typing: base + (remainder > 3 ? 1 : 0),
      meta: base,
    };
  }

  private formatName(value: string): string {
    return value
      .split('-')
      .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
      .join(' ');
  }
}
