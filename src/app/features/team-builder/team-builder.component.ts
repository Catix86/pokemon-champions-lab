import { ChangeDetectionStrategy, Component, inject, signal } from '@angular/core';
import { BattleFormat } from '../../core/models';
import { StoreService } from '../../core/store.service';
import { TeamGeneratorService } from '../../core/team-generator.service';
import { WarningGeneratedTeam } from '../../core/team-builder/team-builder.models';
import { TeamViewComponent } from '../../shared/team-view.component';
@Component({selector:'app-team-builder',imports:[TeamViewComponent],templateUrl:'./team-builder.component.html',styleUrl:'./team-builder.component.scss',changeDetection:ChangeDetectionStrategy.OnPush})
export class TeamBuilderComponent {
 readonly store=inject(StoreService);private readonly generator=inject(TeamGeneratorService);
 readonly format=signal<BattleFormat>('doppio');readonly team=signal<WarningGeneratedTeam|null>(null);readonly message=signal('');readonly generating=signal(false);
 async generate():Promise<void>{if(this.generating())return;this.generating.set(true);this.message.set('Analizzo Anchor, archetipi, coverage, moveset e Item Clause…');this.team.set(null);await new Promise<void>(resolve=>setTimeout(resolve,40));try{this.team.set(this.generator.generateFromBox(this.store.box(),this.format()));this.message.set('Squadra generata.');}catch(error){this.message.set(error instanceof Error?error.message:'Generazione non riuscita.');}finally{this.generating.set(false);}}
 async save():Promise<void>{const value=this.team();if(!value)return;await this.store.saveTeam(value);this.message.set('Squadra salvata.');}
}
