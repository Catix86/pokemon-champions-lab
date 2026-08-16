import { ChangeDetectionStrategy, Component, inject, signal } from '@angular/core';
import { BattleFormat, Team } from '../../core/models';
import { StoreService } from '../../core/store.service';
import { TeamGeneratorService } from '../../core/team-generator.service';
import { TeamViewComponent } from '../../shared/team-view.component';

@Component({ selector: 'app-team-builder', imports: [TeamViewComponent], templateUrl: './team-builder.component.html', styleUrl: './team-builder.component.scss', changeDetection: ChangeDetectionStrategy.OnPush })
export class TeamBuilderComponent {
  readonly store = inject(StoreService);
  private readonly generator = inject(TeamGeneratorService);
  readonly format = signal<BattleFormat>('doppio');
  readonly team = signal<Team | null>(null);
  readonly message = signal('');
  generate(): void {
    try { this.team.set(this.generator.generateFromBox(this.store.box(), this.format())); this.message.set('Ho analizzato il Box e creato la combinazione con il punteggio strategico più alto.'); }
    catch (error) { this.message.set(error instanceof Error ? error.message : 'Generazione non riuscita.'); }
  }
  async save(): Promise<void> { const value = this.team(); if (!value) return; await this.store.saveTeam(value); this.message.set('Squadra salvata.'); }
}
