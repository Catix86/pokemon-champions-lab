import { Injectable, computed, effect, inject, signal } from '@angular/core';
import { collection, deleteDoc, doc, onSnapshot, setDoc } from 'firebase/firestore';
import { AuthService } from './auth/auth.service';
import { firestore } from './firebase';
import { Pokemon, Team } from './models';

@Injectable({ providedIn: 'root' })
export class StoreService {
  private readonly auth = inject(AuthService);
  private stopBox?: () => void;
  private stopTeams?: () => void;

  readonly box = signal<Pokemon[]>([]);
  readonly teams = signal<Team[]>([]);
  readonly cloudReady = signal(false);
  readonly syncing = signal(false);
  readonly error = signal('');
  readonly boxKeys = computed(() => new Set(this.box().map((pokemon) => pokemon.key)));

  constructor() {
    effect(() => {
      const user = this.auth.user();
      this.disposeListeners();
      this.box.set([]);
      this.teams.set([]);
      this.error.set('');

      if (!user || !firestore) {
        this.cloudReady.set(false);
        return;
      }

      this.cloudReady.set(true);
      this.listenToBox(user.uid);
      this.listenToTeams(user.uid);
    });
  }

  async toggleBox(pokemon: Pokemon): Promise<void> {
    const user = this.requireUser();
    const db = this.requireFirestore();
    const owned = this.boxKeys().has(pokemon.key);
    const reference = doc(db, 'users', user.uid, 'box', pokemon.key);

    this.syncing.set(true);
    this.error.set('');
    try {
      if (owned) {
        await deleteDoc(reference);
      } else {
        await setDoc(reference, pokemon);
      }
    } catch (error) {
      this.error.set('Non è stato possibile aggiornare il Box su Firebase.');
      throw error;
    } finally {
      this.syncing.set(false);
    }
  }

  async saveTeam(team: Team): Promise<void> {
    const user = this.requireUser();
    const db = this.requireFirestore();
    const value = { ...team, id: team.id ?? crypto.randomUUID() };

    this.syncing.set(true);
    this.error.set('');
    try {
      await setDoc(doc(db, 'users', user.uid, 'teams', value.id!), value);
    } catch (error) {
      this.error.set('Non è stato possibile salvare la squadra su Firebase.');
      throw error;
    } finally {
      this.syncing.set(false);
    }
  }

  async removeTeam(id: string): Promise<void> {
    const user = this.requireUser();
    const db = this.requireFirestore();

    this.syncing.set(true);
    this.error.set('');
    try {
      await deleteDoc(doc(db, 'users', user.uid, 'teams', id));
    } catch (error) {
      this.error.set('Non è stato possibile eliminare la squadra da Firebase.');
      throw error;
    } finally {
      this.syncing.set(false);
    }
  }

  private listenToBox(uid: string): void {
    this.stopBox = onSnapshot(
      collection(this.requireFirestore(), 'users', uid, 'box'),
      (snapshot) => {
        this.box.set(
          snapshot.docs
            .map((item) => item.data() as Pokemon)
            .sort((first, second) => first.name.localeCompare(second.name, 'it')),
        );
      },
      () => this.error.set('Non è stato possibile caricare il Box da Firebase.'),
    );
  }

  private listenToTeams(uid: string): void {
    this.stopTeams = onSnapshot(
      collection(this.requireFirestore(), 'users', uid, 'teams'),
      (snapshot) => {
        this.teams.set(
          snapshot.docs
            .map((item) => item.data() as Team)
            .sort((first, second) => second.createdAt - first.createdAt),
        );
      },
      () => this.error.set('Non è stato possibile caricare le squadre da Firebase.'),
    );
  }

  private requireUser() {
    const user = this.auth.user();
    if (!user) throw new Error('Utente non autenticato.');
    return user;
  }

  private requireFirestore() {
    if (!firestore) throw new Error('Firebase non è configurato.');
    return firestore;
  }

  private disposeListeners(): void {
    this.stopBox?.();
    this.stopTeams?.();
    this.stopBox = undefined;
    this.stopTeams = undefined;
  }
}
