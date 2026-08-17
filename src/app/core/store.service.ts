import { Injectable, computed, effect, inject, signal } from '@angular/core';
import { collection, deleteDoc, doc, onSnapshot, setDoc } from 'firebase/firestore';
import { AuthService } from './auth/auth.service';
import { firestore } from './firebase';
import { Pokemon, Team } from './models';

@Injectable({providedIn:'root'})
export class StoreService {
  private readonly auth=inject(AuthService);private stopBox?:()=>void;private stopTeams?:()=>void;
  readonly box=signal<Pokemon[]>(this.read('pcm-box',[]));readonly teams=signal<Team[]>(this.read('pcm-teams',[]));readonly cloudReady=signal(false);readonly boxKeys=computed(()=>new Set(this.box().map(p=>p.key)));
  constructor(){effect(()=>{const user=this.auth.user();this.disposeListeners();if(user&&firestore){this.cloudReady.set(true);this.listenToBox(user.uid);this.listenToTeams(user.uid);}else{this.cloudReady.set(false);}});}
  async toggleBox(pokemon:Pokemon):Promise<void>{const user=this.auth.user();const owned=this.boxKeys().has(pokemon.key);this.box.update(rows=>owned?rows.filter(p=>p.key!==pokemon.key):[...rows,pokemon]);this.write('pcm-box',this.box());if(!user||!firestore)return;const ref=doc(firestore,'users',user.uid,'box',pokemon.key);if(owned)await deleteDoc(ref);else await setDoc(ref,pokemon);}
  async saveTeam(team:Team):Promise<void>{const user=this.auth.user();const value={...team,id:team.id??crypto.randomUUID()};this.teams.update(rows=>[value,...rows.filter(t=>t.id!==value.id)]);this.write('pcm-teams',this.teams());if(user&&firestore)await setDoc(doc(firestore,'users',user.uid,'teams',value.id!),value);}
  async removeTeam(id:string):Promise<void>{const user=this.auth.user();this.teams.update(rows=>rows.filter(t=>t.id!==id));this.write('pcm-teams',this.teams());if(user&&firestore)await deleteDoc(doc(firestore,'users',user.uid,'teams',id));}
  private listenToBox(uid:string):void{this.stopBox=onSnapshot(collection(firestore!,'users',uid,'box'),snapshot=>{const rows=snapshot.docs.map(item=>item.data() as Pokemon);this.box.set(rows);this.write('pcm-box',rows);});}
  private listenToTeams(uid:string):void{this.stopTeams=onSnapshot(collection(firestore!,'users',uid,'teams'),snapshot=>{const rows=snapshot.docs.map(item=>item.data() as Team).sort((a,b)=>b.createdAt-a.createdAt);this.teams.set(rows);this.write('pcm-teams',rows);});}
  private disposeListeners():void{this.stopBox?.();this.stopTeams?.();this.stopBox=undefined;this.stopTeams=undefined;}
  private read<T>(key:string,fallback:T):T{try{return JSON.parse(localStorage.getItem(key)??'') as T;}catch{return fallback;}}
  private write(key:string,value:unknown):void{localStorage.setItem(key,JSON.stringify(value));}
}
