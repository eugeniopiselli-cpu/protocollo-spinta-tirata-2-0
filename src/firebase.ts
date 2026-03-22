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
import firebaseConfigJson from '../firebase-applet-config.json';

// Support both AI Studio (JSON) and local development (Environment Variables)
const firebaseConfig = {
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID || firebaseConfigJson.projectId,
  appId: import.meta.env.VITE_FIREBASE_APP_ID || firebaseConfigJson.appId,
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY || firebaseConfigJson.apiKey,
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN || firebaseConfigJson.authDomain,
  storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET || firebaseConfigJson.storageBucket,
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID || firebaseConfigJson.messagingSenderId,
};

const firestoreDatabaseId = import.meta.env.VITE_FIREBASE_DATABASE_ID || firebaseConfigJson.firestoreDatabaseId || '(default)';

// Safety check
if (!firebaseConfig.apiKey || firebaseConfig.apiKey.includes('TODO')) {
  console.error("Firebase configuration is missing. If you are local, check .env. If you are in AI Studio, ensure Firebase is set up.");
}

let app: any;
let db: any;
let auth: any;

try {
  app = initializeApp(firebaseConfig);
  db = getFirestore(app, firestoreDatabaseId);
  auth = getAuth(app);
  
  // Ensure persistence is set to local for better reliability on mobile
  setPersistence(auth, browserLocalPersistence).catch(err => console.error("Persistence error:", err));
} catch (error) {
  console.error("Firebase initialization failed:", error);
  // We'll export null or dummy objects if it fails, but the app should handle it
}

export { app, db, auth };

export const googleProvider = new GoogleAuthProvider();

// Check if the app is running in standalone mode (iOS PWA)
const isStandalone = () => {
  return (window.navigator as any).standalone || window.matchMedia('(display-mode: standalone)').matches;
};

export const signIn = async () => {
  try {
    // Set persistence explicitly to LOCAL
    await setPersistence(auth, browserLocalPersistence);
    
    // On iOS Safari, popups are often blocked but if allowed they are more stable than redirects
    // which lose state due to ITP (Intelligent Tracking Prevention)
    const result = await signInWithPopup(auth, googleProvider);
    return result.user;
  } catch (error: any) {
    console.error("Auth Error:", error);
    
    // If popup is blocked, we explain it to the user or try redirect as last resort
    if (error.code === 'auth/popup-blocked' || error.code === 'auth/cancelled-popup-request') {
      if (isStandalone()) {
        // In PWA mode, we MUST use redirect because popups are even more restricted
        try {
          await signInWithRedirect(auth, googleProvider);
        } catch (reErr) {
          alert("Errore PWA: Prova ad aprire l'app direttamente in Safari.");
        }
      } else {
        alert("Safari ha bloccato la finestra di accesso. Clicca su 'Consenti' quando richiesto o disattiva 'Blocca finestre a comparsa' nelle impostazioni di Safari.");
        // Try redirect as fallback
        await signInWithRedirect(auth, googleProvider);
      }
    } else if (error.code === 'auth/network-request-failed') {
      alert("Connessione assente o instabile.");
    } else if (error.code === 'auth/internal-error') {
      alert("Errore interno di Google. Riprova tra un momento.");
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
