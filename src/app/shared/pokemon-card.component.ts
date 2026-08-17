import { ChangeDetectionStrategy, Component, computed, inject, input, output } from '@angular/core';
import { Pokemon } from '../core/models';
import { PokemonEvaluationService } from '../core/evaluation/pokemon-evaluation.service';
@Component({selector:'app-pokemon-card',templateUrl:'./pokemon-card.component.html',styleUrl:'./pokemon-card.component.scss',changeDetection:ChangeDetectionStrategy.OnPush})
export class PokemonCardComponent { private readonly evaluator=inject(PokemonEvaluationService);readonly pokemon=input.required<Pokemon>();readonly owned=input(false);readonly toggle=output<Pokemon>();readonly evaluation=computed(()=>this.evaluator.evaluateExisting(this.pokemon())); }
