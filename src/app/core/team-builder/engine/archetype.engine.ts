import { Injectable, inject } from '@angular/core';
import { BattleFormat, Pokemon } from '../../models';
import { ProfileFactory } from './profile.factory';
import { TeamArchetype } from '../team-builder.models';
@Injectable({providedIn:'root'}) export class ArchetypeEngine {
 private readonly profiles=inject(ProfileFactory);
 rank(anchor:Pokemon,box:readonly Pokemon[],format:BattleFormat):readonly TeamArchetype[]{const profile=(p:Pokemon)=>this.profiles.resolve(p).profile;const has=(tag:string)=>box.some(p=>profile(p).roles.includes(tag as never));const anchorProfile=profile(anchor);const scores:Record<TeamArchetype,number>={'tailwind-offense':(has('speed-control')?35:0)+(format==='doppio'?12:0),'trick-room':(has('trick-room-setter')?30:0)+(anchorProfile.speed<=60?22:0),rain:(box.some(p=>p.key==='pelipper')?35:0)+(box.some(p=>p.key==='archaludon')?25:0),sun:box.some(p=>['torkoal','charizard'].includes(p.key))?35:0,sand:box.some(p=>['tyranitar','hippowdon'].includes(p.key))?35:0,balance:28,'bulky-offense':box.filter(p=>['Tank','Muro difensivo','Bilanciato'].includes(p.role)).length*7};return(Object.keys(scores) as TeamArchetype[]).sort((a,b)=>scores[b]-scores[a]);}
 score(archetype:TeamArchetype,team:readonly Pokemon[]):number{const keys=new Set(team.map(p=>p.key));let value=25;if(archetype==='rain'&&keys.has('pelipper')&&keys.has('archaludon'))value+=45;if(archetype==='tailwind-offense'&&team.some(p=>this.profiles.resolve(p).profile.roles.includes('speed-control')))value+=30;if(archetype==='trick-room'&&team.some(p=>this.profiles.resolve(p).profile.roles.includes('trick-room-setter')))value+=30;return value;}
}
