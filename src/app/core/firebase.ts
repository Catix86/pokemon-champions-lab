import { getApp, getApps, initializeApp } from 'firebase/app';
import { getAuth } from 'firebase/auth';
import { getFirestore } from 'firebase/firestore';
import { environment } from '../../environments/environment';

export const firebaseConfigured = environment.firebase.apiKey !== 'YOUR_API_KEY';
export const firebaseApp = firebaseConfigured
  ? (getApps().length ? getApp() : initializeApp(environment.firebase))
  : null;
export const firebaseAuth = firebaseApp ? getAuth(firebaseApp) : null;
export const firestore = firebaseApp ? getFirestore(firebaseApp) : null;
