import { Injectable, inject } from '@angular/core';
import { Pokemon } from '../models';
import { ProfileFactory } from '../team-builder/engine/profile.factory';
import { ABILITY_SCORES, ALL_TYPES, PIVOT_MOVES, SPEED_CONTROL_MOVES, TURN_CONTROL_MOVES, multiplier } from './evaluation-data';
import { CURATED_SCORE_FLOORS, META_VIABILITY } from './score-calibration.data';
import { IPokemon, PokemonEvaluation, PokemonScoreBreakdown } from './pokemon-evaluation.models';

@Injectable({providedIn:'root'})
export class PokemonEvaluationService {
  private readonly profiles=inject(ProfileFactory);
  calculatePokemonScore(pokemon:IPokemon):number{return this.evaluate(pokemon).total;}
  evaluate(pokemon:IPokemon):PokemonEvaluation{
    const strengths:string[]=[];const warnings:string[]=[];
    const calculated:PokemonScoreBreakdown={
      stats:this.scoreStats(pokemon,strengths), ability:this.scoreAbilities(pokemon,strengths),
      movepool:this.scoreMovepool(pokemon,strengths), typing:this.scoreTyping(pokemon,strengths,warnings),
      meta:this.scoreMeta(pokemon,strengths,warnings),
    };
    const floor=CURATED_SCORE_FLOORS[pokemon.key];
    const breakdown=floor?{
      stats:Math.max(calculated.stats,floor.stats), ability:Math.max(calculated.ability,floor.ability),
      movepool:Math.max(calculated.movepool,floor.movepool), typing:Math.max(calculated.typing,floor.typing),
      meta:Math.max(calculated.meta,floor.meta),
    }:calculated;
    return{total:Object.values(breakdown).reduce((sum,value)=>sum+value,0),breakdown,strengths:[...new Set(strengths)].slice(0,6),warnings:[...new Set(warnings)]};
  }
  evaluateExisting(pokemon:Pokemon):PokemonEvaluation{
    const p=this.profiles.resolve(pokemon).profile;
    return this.evaluate({id:pokemon.id,key:pokemon.key,name:pokemon.name,types:pokemon.types,
      baseStats:{hp:p.hp,attack:p.attack,defense:p.defense,specialAttack:p.specialAttack,specialDefense:p.specialDefense,speed:p.speed},
      abilities:[{id:p.ability.toLowerCase(),name:p.ability}],moves:p.moves.map(m=>({id:m.name.toLowerCase(),name:m.name,type:m.type,category:m.category,power:m.power,accuracy:m.accuracy,tags:m.tags})),
      megaEligible:p.megaEligible,roleHint:p.attack>p.specialAttack?'physical':p.specialAttack>p.attack?'special':'mixed',dependencyTags:this.dependencies(pokemon.key)});
  }
  private scoreStats(p:IPokemon,strengths:string[]):number{const s=p.baseStats;const role=p.roleHint??(s.attack>s.specialAttack*1.12?'physical':s.specialAttack>s.attack*1.12?'special':'mixed');const useful=role==='physical'?s.attack:role==='special'?s.specialAttack:Math.max(s.attack,s.specialAttack);const wasted=role==='physical'?s.specialAttack:role==='special'?s.attack:Math.min(s.attack,s.specialAttack);const offense=this.clamp((useful-60)/65,0,1)*8;const minMax=this.clamp((useful-wasted+40)/80,0,1)*4;const speed=s.speed>100?4+Math.min(2,(s.speed-100)/15):s.speed<40?5:s.speed>=70&&s.speed<=85?2:3;const bulk=s.hp*((s.defense+s.specialDefense)/2);const survival=this.clamp((bulk-4200)/6200,0,1)*5;if(minMax>=3)strengths.push('Statistiche ottimizzate per il ruolo');if(speed>=5)strengths.push(s.speed<40?'Eccellente sotto Distortozona':'Speed tier elevato');if(survival>=4)strengths.push('Bulk effettivo elevato');return this.round(this.clamp(offense+minMax+speed+survival,0,20));}
  private scoreAbilities(p:IPokemon,strengths:string[]):number{let score=Math.max(5,...p.abilities.map(a=>ABILITY_SCORES[a.name.toLowerCase()]??9));if(score>=18)strengths.push('Abilità ad altissimo impatto');if(p.megaEligible){score+=4;strengths.push('Versatilità tramite Megaevoluzione');}return this.round(this.clamp(score,0,20));}
  private scoreMovepool(p:IPokemon,strengths:string[]):number{const names=new Set(p.moves.map(m=>m.name.toLowerCase()));const damaging=p.moves.filter(m=>m.category!=='status'&&(m.power??0)>0);const reliable=damaging.filter(m=>p.types.includes(m.type)&&(m.power??0)>=80&&(m.accuracy??0)>=90&&!m.hasSevereDrawback);const coverage=new Set(damaging.map(m=>m.type));let score=Math.min(5,damaging.length*1.25)+Math.min(3,Math.max(0,coverage.size-p.types.length)*1.5)+Math.min(3,p.moves.filter(m=>m.category==='status').length*1.5);if([...PIVOT_MOVES].some(x=>names.has(x))){score+=5;strengths.push('Accesso al pivoting');}if([...SPEED_CONTROL_MOVES].some(x=>names.has(x))){score+=5;strengths.push('Controllo della velocità');}if([...TURN_CONTROL_MOVES].some(x=>names.has(x))){score+=5;strengths.push(names.has('bruciapelo')?'Accesso a Bruciapelo':'Controllo del turno');}if(reliable.length){score+=5;strengths.push('STAB potente e affidabile');}return this.round(this.clamp(score,0,20));}
  private scoreTyping(p:IPokemon,strengths:string[],warnings:string[]):number{let resist=0,immune=0,weak=0,doubleWeak=0;for(const attack of ALL_TYPES){const value=multiplier(attack,p.types);if(value===0)immune++;else if(value<=.5)resist++;else if(value>=4)doubleWeak++;else if(value>1)weak++;}const defense=this.clamp(5+resist*.75+immune*1.5-weak*.65-doubleWeak*1.7,0,10);const neutral=ALL_TYPES.filter(t=>p.types.some(a=>multiplier(a,[t])>=1)).length/ALL_TYPES.length;const effective=ALL_TYPES.filter(t=>p.types.some(a=>multiplier(a,[t])>1)).length/ALL_TYPES.length;const offense=this.clamp(neutral*6+effective*8,0,10);if(defense>=8)strengths.push('Ottimo typing difensivo');if(offense>=8)strengths.push('STAB con ampia copertura offensiva');if(doubleWeak)warnings.push('Presente una debolezza x4');return this.round(defense+offense);}
  private scoreMeta(p:IPokemon,strengths:string[],warnings:string[]):number{const known=META_VIABILITY[p.key];if(known!==undefined){if(known>=18)strengths.push('Presenza consolidata nel meta');return known;}const tags=new Set(p.dependencyTags??[]);const ability=Math.max(0,...p.abilities.map(a=>ABILITY_SCORES[a.name.toLowerCase()]??9));const offense=Math.max(p.baseStats.attack,p.baseStats.specialAttack);const compression=p.moves.some(m=>m.category==='status')&&p.moves.some(m=>m.category!=='status');let score=6+this.clamp((offense-70)/22,0,4)+this.clamp((ability-6)/4,0,4)+(compression?3:0)+(tags.has('self-sufficient')?3:0)-(tags.has('weather')?3:0)-(tags.has('trick-room')?2:0)-(tags.has('ally-combo')?4:0)-(tags.has('setup')?1:0);score=this.clamp(score,0,20);if(score<=7)warnings.push('Richiede supporto specifico per rendere al massimo');else if(score>=16)strengths.push('Facile da inserire in molte squadre');return this.round(score);}
  private dependencies(key:string):IPokemon['dependencyTags']{if(['castform','avalugg','crabominable'].includes(key))return['ally-combo'];if(key==='archaludon')return['weather'];if(key==='kingambit')return['setup'];if(['incineroar','gholdengo','garchomp'].includes(key))return['self-sufficient'];return[];}
  private clamp(v:number,min:number,max:number){return Math.max(min,Math.min(max,v));}private round(v:number){return Math.round(v);}
}
