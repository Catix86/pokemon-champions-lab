import { Injectable } from '@angular/core';
import { Pokemon, PokemonType } from '../../models';
import { CompetitiveMove, CompetitiveProfile, ResolvedProfile } from '../team-builder.models';
import { PROFILES } from '../data/profiles.data';

const move = (name: string, type: PokemonType, category: 'physical' | 'special' | 'status', power = 0): CompetitiveMove => ({ name, type, category, power, accuracy: 100, tags: category === 'status' ? ['status'] : [] });
@Injectable({ providedIn: 'root' })
export class ProfileFactory {
  resolve(pokemon: Pokemon): ResolvedProfile {
    const curated = PROFILES[pokemon.key];
    if (curated) return { profile: curated, confidence: 'curated' };
    const primary = pokemon.types[0] ?? 'Normale';
    const secondary = pokemon.types[1] ?? primary;
    const offensive = ['Attaccante veloce', 'Wallbreaker', 'Offensivo'].includes(pokemon.role);
    const speed = pokemon.role === 'Attaccante veloce' ? 110 : pokemon.role.includes('Supporto') ? 75 : 85;
    const bulk = ['Tank', 'Muro difensivo'].includes(pokemon.role) ? 110 : 80;
    const profile: CompetitiveProfile = {
      key: pokemon.key, speed, attack: offensive ? 110 : 85, specialAttack: offensive ? 105 : 85,
      hp: bulk, defense: bulk, specialDefense: bulk, ability: 'Abilità migliore disponibile', megaEligible: false,
      roles: pokemon.role.includes('Supporto') ? ['utility'] : ['physical-sweeper'],
      moves: [
        move(`STAB ${primary}`, primary, 'physical', 90),
        move(`STAB ${secondary}`, secondary, 'special', 90),
        move('Copertura consigliata', 'Normale', 'physical', 75),
        move(pokemon.role.includes('Supporto') ? 'Utility consigliata' : 'Setup consigliato', 'Normale', 'status'),
      ],
    };
    return { profile, confidence: pokemon.types.length ? 'generated' : 'limited' };
  }
}
