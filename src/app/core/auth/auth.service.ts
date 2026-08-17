import { Injectable, computed, signal } from '@angular/core';
import {
  User,
  browserLocalPersistence,
  createUserWithEmailAndPassword,
  onAuthStateChanged,
  sendPasswordResetEmail,
  setPersistence,
  signInWithEmailAndPassword,
  signOut,
} from 'firebase/auth';
import { firebaseAuth } from '../firebase';

@Injectable({ providedIn: 'root' })
export class AuthService {
  readonly user = signal<User | null>(null);
  readonly initialized = signal(false);
  readonly loading = signal(false);
  readonly error = signal('');
  readonly authenticated = computed(() => this.user() !== null);

  constructor() {
    if (!firebaseAuth) {
      this.initialized.set(true);
      this.error.set('Firebase non è configurato.');
      return;
    }
    void setPersistence(firebaseAuth, browserLocalPersistence);
    onAuthStateChanged(firebaseAuth, (user) => {
      this.user.set(user);
      this.initialized.set(true);
    });
  }

  async login(email: string, password: string): Promise<void> {
    await this.run(async () => {
      if (!firebaseAuth) throw new Error('Firebase non è configurato.');
      await signInWithEmailAndPassword(firebaseAuth, email.trim(), password);
    });
  }

  async register(email: string, password: string): Promise<void> {
    await this.run(async () => {
      if (!firebaseAuth) throw new Error('Firebase non è configurato.');
      await createUserWithEmailAndPassword(firebaseAuth, email.trim(), password);
    });
  }

  async resetPassword(email: string): Promise<void> {
    await this.run(async () => {
      if (!firebaseAuth) throw new Error('Firebase non è configurato.');
      await sendPasswordResetEmail(firebaseAuth, email.trim());
    });
  }

  async logout(): Promise<void> {
    if (firebaseAuth) await signOut(firebaseAuth);
  }

  private async run(action: () => Promise<void>): Promise<void> {
    this.loading.set(true);
    this.error.set('');
    try {
      await action();
    } catch (error: unknown) {
      this.error.set(this.toMessage(error));
      throw error;
    } finally {
      this.loading.set(false);
    }
  }

  private toMessage(error: unknown): string {
    const code = typeof error === 'object' && error && 'code' in error ? String(error.code) : '';
    const messages: Record<string, string> = {
      'auth/invalid-credential': 'Email o password non corretti.',
      'auth/email-already-in-use': 'Esiste già un account con questa email.',
      'auth/invalid-email': 'Inserisci un indirizzo email valido.',
      'auth/weak-password': 'La password non rispetta i requisiti minimi.',
      'auth/too-many-requests': 'Troppi tentativi. Riprova più tardi.',
      'auth/network-request-failed': 'Connessione non disponibile.',
      'auth/user-disabled': 'Questo account è stato disabilitato.',
    };
    return messages[code] ?? 'Operazione non riuscita. Riprova.';
  }
}
