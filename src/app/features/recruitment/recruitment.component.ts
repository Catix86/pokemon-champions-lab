import { ChangeDetectionStrategy, Component, computed, inject, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { Pokemon } from '../../core/models';
import { PokemonService } from '../../core/pokemon.service';
import { StoreService } from '../../core/store.service';

interface RankedPokemon extends Pokemon { recruitmentScore: number; reason: string; }
@Component({ selector: 'app-recruitment', imports: [FormsModule], templateUrl: './recruitment.component.html', styleUrl: './recruitment.component.scss', changeDetection: ChangeDetectionStrategy.OnPush })
export class RecruitmentComponent {
  readonly dex = inject(PokemonService); readonly store = inject(StoreService);
  readonly query = signal(''); readonly pasture = signal<Pokemon[]>([]); readonly ranking = signal<RankedPokemon[]>([]);
  readonly suggestions = computed(() => { const q=this.query().trim().toLowerCase(); return q.length<2?[]:this.dex.catalog().filter(p=>p.name.toLowerCase().startsWith(q)&&!this.pasture().some(x=>x.key===p.key)).slice(0,7); });
  constructor(){ void this.dex.loadCatalog(); }
  add(p: Pokemon): void { this.pasture.update(x=>[...x,p]); this.query.set(''); this.ranking.set([]); }
  remove(key: string): void { this.pasture.update(x=>x.filter(p=>p.key!==key)); this.ranking.set([]); }
  analyze(): void { const ownedTypes=new Set(this.store.box().flatMap(p=>p.types)); const ownedRoles=new Set(this.store.box().map(p=>p.role)); this.ranking.set(this.pasture().map(p=>{const newTypes=p.types.filter(t=>!ownedTypes.has(t)).length;const newRole=ownedRoles.has(p.role)?0:1;const score=p.score+newTypes*12+newRole*7;const reason=`${p.tier} tier (${p.score}/100), ${newTypes?`${newTypes} nuovi tipi coperti`:'copertura già presente'}, ${newRole?'aggiunge un ruolo mancante':'ruolo già disponibile'}.`;return{...p,recruitmentScore:score,reason};}).sort((a,b)=>b.recruitmentScore-a.recruitmentScore)); }
  recruit(p: Pokemon): void { if(!this.store.boxKeys().has(p.key))this.store.toggleBox(p); this.remove(p.key); }
}
