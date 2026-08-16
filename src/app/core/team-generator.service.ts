import { Injectable } from '@angular/core';
import { BattleFormat, MoveSet, Pokemon, PokemonType, Team, TeamMember } from './models';

const MOVES: Record<PokemonType, readonly string[]> = {
  Normale: ['Protezione', 'Extrarapido'], Fuoco: ['Fuococarica', 'Bruciapelo'], Acqua: ['Idrondata', 'Acquagetto'],
  Elettro: ['Fulmine', 'Invertivolt'], Erba: ['Energipalla', 'Erbascivolata'], Ghiaccio: ['Geloraggio', 'Gelolancia'],
  Lotta: ['Zuffa', 'Assorbipugno'], Veleno: ['Fangobomba', 'Velenpuntura'], Terra: ['Terremoto', 'Geoforza'],
  Volante: ['Tifone', 'Baldeali'], Psico: ['Psichico', 'Psicotaglio'], Coleottero: ['Retromarcia', 'Forbice X'],
  Roccia: ['Frana', 'Gemmoforza'], Spettro: ['Palla Ombra', 'Furtivombra'], Drago: ['Dragobolide', 'Dragartigli'],
  Buio: ['Sbigoattacco', 'Privazione'], Acciaio: ['Metaltestata', 'Corsa all’Oro'], Folletto: ['Forza Lunare', 'Magibrillio'],
};

const ITEMS = ['Avanzi', 'Assault Vest', 'Bendascelta', 'Focalnastro', 'Vulneropolizza', 'Amuleto Puro'] as const;

const CORE_BONUSES: readonly (readonly [string, string, number])[] = [
  ['pelipper', 'archaludon', 26], ['politoed', 'archaludon', 22], ['whimsicott', 'garchomp', 20],
  ['incineroar', 'gholdengo', 16], ['incineroar', 'sinistcha', 18], ['kingambit', 'gholdengo', 15],
  ['farigiraf', 'sneasler', 17], ['ninetales-alola', 'dragonite', 16], ['tyranitar', 'garchomp', 14],
];

@Injectable({ providedIn: 'root' })
export class TeamGeneratorService {
  generateFromBox(box: Pokemon[], format: BattleFormat): Team {
    const size = format === 'singolo' ? 6 : 6;
    if (box.length < size) throw new Error(`Servono almeno ${size} Pokémon nel Box.`);

    const members = this.selectBestCombination(box, size, format);
    return {
      name: `${this.archetype(members)} · ${new Date().toLocaleDateString('it-IT')}`,
      format,
      members: members.map((pokemon, index) => this.member(pokemon, ITEMS[index])),
      strategy: this.strategy(members, format),
      createdAt: Date.now(),
    };
  }

  private selectBestCombination(box: Pokemon[], size: number, format: BattleFormat): Pokemon[] {
    const candidates = [...box].sort((a, b) => b.score - a.score).slice(0, 18);
    let beam: Pokemon[][] = [[]];
    for (let slot = 0; slot < size; slot += 1) {
      beam = beam.flatMap((team) => candidates.filter((p) => !team.includes(p)).map((p) => [...team, p]))
        .sort((a, b) => this.teamScore(b, format) - this.teamScore(a, format)).slice(0, 120);
    }
    return beam[0];
  }

  private teamScore(team: Pokemon[], format: BattleFormat): number {
    const types = new Set(team.flatMap((p) => p.types));
    const roles = new Set(team.map((p) => p.role));
    let score = team.reduce((sum, p) => sum + p.score, 0) + types.size * 4 + roles.size * 7;
    for (const [first, second, bonus] of CORE_BONUSES) {
      if (team.some((p) => p.key === first) && team.some((p) => p.key === second)) score += bonus;
    }
    if (format === 'doppio') {
      score += team.filter((p) => p.role.includes('Supporto')).length * 9;
      score += team.filter((p) => p.role === 'Attaccante veloce').length * 5;
    } else {
      score += team.filter((p) => ['Muro difensivo', 'Wallbreaker'].includes(p.role)).length * 8;
    }
    const duplicateTypes = team.flatMap((p) => p.types).length - types.size;
    return score - duplicateTypes * 3;
  }

  private member(pokemon: Pokemon, item: string): TeamMember {
    const primary = pokemon.types[0] ?? 'Normale';
    const secondary = pokemon.types[1] ?? primary;
    const support = pokemon.role.includes('Supporto');
    const moves: MoveSet[] = [
      { name: MOVES[primary][0], type: primary }, { name: MOVES[secondary][1] ?? MOVES[secondary][0], type: secondary },
      { name: support ? 'Monito' : 'Protezione', type: support ? 'Buio' : 'Normale' },
      { name: pokemon.score >= 85 ? 'Tera Esplosione' : 'Sostituto', type: 'Normale' },
    ];
    return {
      pokemon, item, moves,
      nature: pokemon.role === 'Attaccante veloce' ? 'Allegra' : pokemon.role === 'Muro difensivo' ? 'Scaltra' : 'Decisa',
      evs: pokemon.role === 'Muro difensivo' ? '252 PS / 252 Dif / 4 SpD' : support ? '252 PS / 156 Dif / 100 SpD' : '252 Atk/SpA / 252 Vel / 4 PS',
    };
  }

  private archetype(team: Pokemon[]): string {
    const keys = new Set(team.map((p) => p.key));
    if ((keys.has('pelipper') || keys.has('politoed')) && keys.has('archaludon')) return 'Rain Balance';
    if (keys.has('tyranitar') || keys.has('hippowdon')) return 'Sand Balance';
    if (keys.has('whimsicott')) return 'Tailwind Offense';
    if (team.filter((p) => p.role.includes('Supporto')).length >= 2) return 'Bulky Balance';
    return 'Meta Offense';
  }

  private strategy(team: Pokemon[], format: BattleFormat): string {
    const names = team.map((p) => p.name).join(', ');
    const coverage = new Set(team.flatMap((p) => p.types)).size;
    return `Ho scelto ${names} confrontando punteggio, copertura di ${coverage} tipi, varietà dei ruoli e nuclei ricorrenti nel meta. ${format === 'doppio' ? 'Il piano principale crea controllo del ritmo e pressione a due bersagli, mantenendo almeno un supporto per proteggere gli attaccanti.' : 'Il piano alterna pivot, muro e wallbreaker, conservando il Pokémon più veloce come cleaner nel finale.'} Gli strumenti sono tutti diversi e rispettano la Item Clause.`;
  }
}
