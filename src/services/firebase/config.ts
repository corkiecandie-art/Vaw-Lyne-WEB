import { initializeApp, getApps, getApp } from 'firebase/app';
import { getAuth } from 'firebase/auth';
import { getFirestore } from 'firebase/firestore';
import { getStorage } from 'firebase/storage';
import firebaseAppletConfig from '../../../firebase-applet-config.json';

const firebaseConfig = {
  apiKey: firebaseAppletConfig?.apiKey || (import.meta as any).env.VITE_FIREBASE_API_KEY,
  authDomain: firebaseAppletConfig?.authDomain || (import.meta as any).env.VITE_FIREBASE_AUTH_DOMAIN,
  projectId: firebaseAppletConfig?.projectId || (import.meta as any).env.VITE_FIREBASE_PROJECT_ID,
  storageBucket: firebaseAppletConfig?.storageBucket || (import.meta as any).env.VITE_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: firebaseAppletConfig?.messagingSenderId || (import.meta as any).env.VITE_FIREBASE_MESSAGING_SENDER_ID,
  appId: firebaseAppletConfig?.appId || (import.meta as any).env.VITE_FIREBASE_APP_ID,
};

const firestoreDatabaseId = firebaseAppletConfig?.firestoreDatabaseId;

// Check if we have valid Firebase config variables (not empty or undefined)
export const isFirebaseConfigured = !!(
  firebaseConfig.apiKey &&
  firebaseConfig.projectId &&
  firebaseConfig.authDomain &&
  !firebaseConfig.apiKey.startsWith('YOUR_') &&
  !firebaseConfig.apiKey.includes('placeholder')
);

let app: any = null;
let auth: any = null;
let db: any = null;
let storage: any = null;

if (isFirebaseConfigured) {
  try {
    app = getApps().length === 0 ? initializeApp(firebaseConfig) : getApp();
    auth = getAuth(app);
    db = firestoreDatabaseId ? getFirestore(app, firestoreDatabaseId) : getFirestore(app);
    storage = getStorage(app);
    console.log('[Firebase config] Live Firebase initialization successful. Project:', firebaseConfig.projectId, 'Database:', firestoreDatabaseId || '(default)');
  } catch (error) {
    console.error('[Firebase config] Live Firebase failed to initialize:', error);
  }
} else {
  console.log('[Firebase config] Firebase keys are missing or placeholders.');
}

export { auth, db, storage, firestoreDatabaseId };

