import { ChangeDetectionStrategy, Component, computed, effect, inject, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { PokemonEvaluationService } from '../../core/evaluation/pokemon-evaluation.service';
import { PokemonRole, PokemonType, Tier } from '../../core/models';
import { PokemonService } from '../../core/pokemon.service';
import { StoreService } from '../../core/store.service';
import { PokemonCardComponent } from '../../shared/pokemon-card.component';

type SortOption = 'score-desc' | 'score-asc' | 'name-asc' | 'name-desc' | 'tier';

@Component({
  selector: 'app-pokedex',
  imports: [FormsModule, PokemonCardComponent],
  templateUrl: './pokedex.component.html',
  styleUrl: './pokedex.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class PokedexComponent {
  readonly dex = inject(PokemonService);
  readonly store = inject(StoreService);
  private readonly evaluator = inject(PokemonEvaluationService);

  readonly query = signal('');
  readonly selectedType = signal<PokemonType | ''>('');
  readonly selectedRole = signal<PokemonRole | ''>('');
  readonly selectedTier = signal<Tier | ''>('');
  readonly sortOption = signal<SortOption>('score-desc');
  readonly page = signal(1);
  readonly pageSize = 24;

  readonly types: readonly PokemonType[] = [
    'Normale', 'Fuoco', 'Acqua', 'Elettro', 'Erba', 'Ghiaccio', 'Lotta', 'Veleno',
    'Terra', 'Volante', 'Psico', 'Coleottero', 'Roccia', 'Spettro', 'Drago', 'Buio',
    'Acciaio', 'Folletto',
  ];
  readonly roles: readonly PokemonRole[] = [
    'Attaccante veloce', 'Supporto', 'Tank', 'Muro difensivo', 'Wallbreaker',
    'Bilanciato', 'Offensivo', 'Supporto/Pivot',
  ];
  readonly tiers: readonly Tier[] = ['S', 'A', 'B', 'C', 'D', 'E'];

  readonly evaluatedCatalog = computed(() =>
    this.dex.catalog().map((pokemon) => {
      const evaluation = this.evaluator.evaluateExisting(pokemon);
      return {
        pokemon,
        score: evaluation.total,
        tier: this.tierFromScore(evaluation.total),
      };
    }),
  );

  readonly filtered = computed(() => {
    const query = this.normalize(this.query());
    const selectedType = this.selectedType();
    const selectedRole = this.selectedRole();
    const selectedTier = this.selectedTier();

    const rows = this.evaluatedCatalog().filter(({ pokemon, tier }) => {
      const matchesName = !query || this.normalize(pokemon.name).includes(query);
      const matchesType = !selectedType || pokemon.types.includes(selectedType);
      const matchesRole = !selectedRole || pokemon.role === selectedRole;
      const matchesTier = !selectedTier || tier === selectedTier;
      return matchesName && matchesType && matchesRole && matchesTier;
    });

    return [...rows].sort((first, second) => {
      switch (this.sortOption()) {
        case 'score-asc':
          return first.score - second.score || first.pokemon.name.localeCompare(second.pokemon.name, 'it');
        case 'name-asc':
          return first.pokemon.name.localeCompare(second.pokemon.name, 'it');
        case 'name-desc':
          return second.pokemon.name.localeCompare(first.pokemon.name, 'it');
        case 'tier':
          return this.tierRank(first.tier) - this.tierRank(second.tier) || second.score - first.score;
        case 'score-desc':
        default:
          return second.score - first.score || first.pokemon.name.localeCompare(second.pokemon.name, 'it');
      }
    });
  });

  readonly visible = computed(() => this.filtered().slice(0, this.page() * this.pageSize));
  readonly remaining = computed(() => Math.max(0, this.filtered().length - this.visible().length));
  readonly activeFilterCount = computed(() =>
    [this.query().trim(), this.selectedType(), this.selectedRole(), this.selectedTier()].filter(Boolean).length,
  );

  constructor() {
    void this.dex.loadCatalog();
    effect(() => {
      void this.dex.hydratePage(this.visible().slice(-this.pageSize).map((row) => row.pokemon));
    });
  }

  onFilterChange(): void {
    this.page.set(1);
  }

  clearFilters(): void {
    this.query.set('');
    this.selectedType.set('');
    this.selectedRole.set('');
    this.selectedTier.set('');
    this.sortOption.set('score-desc');
    this.page.set(1);
  }

  private tierFromScore(score: number): Tier {
    if (score >= 90) return 'S';
    if (score >= 80) return 'A';
    if (score >= 70) return 'B';
    if (score >= 60) return 'C';
    if (score >= 50) return 'D';
    return 'E';
  }

  private tierRank(tier: Tier): number {
    return this.tiers.indexOf(tier);
  }

  private normalize(value: string): string {
    return value.trim().toLocaleLowerCase('it');
  }
}
