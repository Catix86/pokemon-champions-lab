import { Injectable } from '@angular/core';
import { Pokemon, PokemonType } from '../../models';
import { CompetitiveMove, MetaThreat } from '../team-builder.models';
import { ALL_TYPES, effectiveness } from '../data/type-chart.data';
@Injectable({providedIn:'root'}) export class CoverageEngine {
 defensiveScore(team: readonly Pokemon[]): {score:number;violations:string[]} { const violations:string[]=[];let score=100;for(const type of ALL_TYPES){let weak=0,resist=0,immune=0;for(const p of team){const value=effectiveness(type,p.types);if(value===0)immune++;else if(value>1)weak++;else if(value<1)resist++;}score+=resist*2+immune*6-weak*weak*3;if(weak>2&&immune<1&&resist<2){violations.push(`Troppi membri deboli a ${type}`);score-=35;}}return{score,violations};}
 offensiveCoverage(moves:readonly CompetitiveMove[],threats:readonly MetaThreat[]):number{const total=threats.reduce((s,t)=>s+t.weight,0);const covered=threats.filter(t=>moves.some(m=>m.category!=='status'&&effectiveness(m.type,t.types)>=2)).reduce((s,t)=>s+t.weight,0);return total?covered/total*100:0;}
 uncovered(moves:readonly CompetitiveMove[],threats:readonly MetaThreat[]):readonly MetaThreat[]{return threats.filter(t=>!moves.some(m=>m.category!=='status'&&effectiveness(m.type,t.types)>=2));}
}
