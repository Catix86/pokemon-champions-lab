import { Injectable, computed, signal } from '@angular/core';
import { initializeApp } from 'firebase/app';
import { getAuth, onAuthStateChanged, signInAnonymously } from 'firebase/auth';
import { collection, deleteDoc, doc, getFirestore, onSnapshot, setDoc } from 'firebase/firestore';
import { environment } from '../../environments/environment'; import { Pokemon, Team } from './models';
@Injectable({providedIn:'root'}) export class StoreService {
 readonly box=signal<Pokemon[]>(this.read<Pokemon[]>('pcm-box',[])); readonly teams=signal<Team[]>(this.read<Team[]>('pcm-teams',[])); readonly cloudReady=signal(false); readonly boxKeys=computed(()=>new Set(this.box().map(p=>p.key))); private uid=''; private db:ReturnType<typeof getFirestore>|null=null;
 constructor(){void this.init();}
 toggleBox(p:Pokemon):void{const wasOwned=this.boxKeys().has(p.key);const next=wasOwned?this.box().filter(x=>x.key!==p.key):[...this.box(),p];this.box.set(next);this.write('pcm-box',next);void this.syncBox(p,wasOwned);}
 async saveTeam(team:Team):Promise<void>{const value={...team,id:team.id??crypto.randomUUID()};this.teams.update(x=>[value,...x.filter(t=>t.id!==value.id)]);this.write('pcm-teams',this.teams());if(this.db&&this.uid)await setDoc(doc(this.db,'users',this.uid,'teams',value.id!),value);}
 async removeTeam(id:string):Promise<void>{this.teams.update(x=>x.filter(t=>t.id!==id));this.write('pcm-teams',this.teams());if(this.db&&this.uid)await deleteDoc(doc(this.db,'users',this.uid,'teams',id));}
 private async init(){if(environment.firebase.apiKey==='YOUR_API_KEY')return;try{const app=initializeApp(environment.firebase);const auth=getAuth(app);this.db=getFirestore(app);onAuthStateChanged(auth,u=>{if(u){this.uid=u.uid;this.cloudReady.set(true);this.listen();}});await signInAnonymously(auth);}catch{this.cloudReady.set(false);}}
 private listen(){if(!this.db)return;onSnapshot(collection(this.db,'users',this.uid,'teams'),s=>{const rows=s.docs.map(d=>d.data() as Team);if(rows.length){this.teams.set(rows.sort((a,b)=>b.createdAt-a.createdAt));this.write('pcm-teams',this.teams());}});}
 private async syncBox(p:Pokemon,remove:boolean){if(!this.db||!this.uid)return;const ref=doc(this.db,'users',this.uid,'box',p.key);if(remove)await deleteDoc(ref);else await setDoc(ref,p);}
 private read<T>(key:string,fallback:T):T{try{return JSON.parse(localStorage.getItem(key)??'') as T}catch{return fallback}}
 private write(key:string,value:unknown){localStorage.setItem(key,JSON.stringify(value));}
}