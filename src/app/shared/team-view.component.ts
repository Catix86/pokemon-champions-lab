import { ChangeDetectionStrategy, Component, input, output } from '@angular/core';
import { Team } from '../core/models';
import { TypeIconComponent } from './type-icon.component';
@Component({ selector:'app-team-view', imports:[TypeIconComponent], templateUrl:'./team-view.component.html', styleUrl:'./team-view.component.scss', changeDetection:ChangeDetectionStrategy.OnPush })
export class TeamViewComponent { readonly team=input.required<Team>(); readonly removable=input(false); readonly remove=output<string>(); }
