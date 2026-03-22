import { initializeApp } from 'firebase/app';
import { 
  getAuth, 
  GoogleAuthProvider, 
  signInWithPopup, 
  signInWithRedirect,
  getRedirectResult,
  signOut, 
  setPersistence, 
  browserLocalPersistence 
} from 'firebase/auth';
import { getFirestore } from 'firebase/firestore';

const firebaseConfig = {
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID,
  appId: import.meta.env.VITE_FIREBASE_APP_ID,
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY,
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN,
  storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID,
};

const firestoreDatabaseId = import.meta.env.VITE_FIREBASE_DATABASE_ID || '(default)';

let app: any;
let db: any;
let auth: any;

try {
  app = initializeApp(firebaseConfig);
  db = getFirestore(app, firestoreDatabaseId);
  auth = getAuth(app);
  setPersistence(auth, browserLocalPersistence).catch(err => console.error("Persistence error:", err));
} catch (error) {
  console.error("Firebase initialization failed:", error);
}

export { app, db, auth };

export const googleProvider = new GoogleAuthProvider();

const isStandalone = () => {
  return (window.navigator as any).standalone || window.matchMedia('(display-mode: standalone)').matches;
};

export const signIn = async () => {
  try {
    await setPersistence(auth, browserLocalPersistence);
    const result = await signInWithPopup(auth, googleProvider);
    return result.user;
  } catch (error: any) {
    console.error("Auth Error:", error);
    if (error.code === 'auth/popup-blocked' || error.code === 'auth/cancelled-popup-request') {
      if (isStandalone()) {
        try {
          await signInWithRedirect(auth, googleProvider);
        } catch (reErr) {
          alert("Errore PWA: Prova ad aprire l'app direttamente in Safari.");
        }
      } else {
        alert("Safari ha bloccato la finestra di accesso. Disattiva 'Blocca finestre a comparsa' nelle impostazioni di Safari.");
        await signInWithRedirect(auth, googleProvider);
      }
    } else if (error.code === 'auth/network-request-failed') {
      alert("Connessione assente o instabile.");
    } else {
      alert("Errore: " + error.message);
    }
    throw error;
  }
};

export const handleRedirectResult = async (authInstance?: any, setUser?: any, setAuthLoading?: any) => {
  try {
    const result = await getRedirectResult(authInstance || auth);
    if (result?.user && setUser) {
      setUser(result.user);
    }
    return result;
  } catch (error) {
    console.error("Redirect result error:", error);
    throw error;
  } finally {
    if (setAuthLoading) setAuthLoading(false);
  }
};

export const logOut = () => signOut(auth);
