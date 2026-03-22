# Protocollo 2.0 - Workout App

App professionale per il tracciamento degli allenamenti basata sul Protocollo 2.0. Sviluppata con React, TypeScript, Tailwind CSS e Firebase.

## 🚀 Funzionalità
- **Tracciamento Real-time:** Registra serie, ripetizioni e carichi.
- **Progressi:** Visualizza grafici avanzati delle tue performance.
- **PWA Ready:** Installabile su iPhone e Android come una vera app.
- **Cloud Sync:** I tuoi dati sono sempre al sicuro con Firebase.
- **Dark Mode:** Design "Hardware" ispirato alle attrezzature da palestra professionali.

## 🛠️ Setup per lo Sviluppo

1. **Clona il repository:**
   ```bash
   git clone https://github.com/tuo-username/protocollo-spinta-tirata-2-0.git
   cd protocollo-spinta-tirata-2-0
   ```

2. **Installa le dipendenze:**
   ```bash
   npm install
   ```

3. **Configura le variabili d'ambiente:**
   Crea un file `.env` nella root del progetto e aggiungi le tue chiavi Firebase:
   ```env
   VITE_FIREBASE_API_KEY=tua_api_key
   VITE_FIREBASE_AUTH_DOMAIN=tuo_progetto.firebaseapp.com
   VITE_FIREBASE_PROJECT_ID=tuo_progetto
   VITE_FIREBASE_STORAGE_BUCKET=tuo_progetto.appspot.com
   VITE_FIREBASE_MESSAGING_SENDER_ID=tuo_id
   VITE_FIREBASE_APP_ID=tuo_app_id
   ```

4. **Avvia in locale:**
   ```bash
   npm run dev
   ```

## 📦 Deploy su GitHub Pages

Per pubblicare l'app su GitHub Pages:

1. **Configura GitHub Secrets:**
   Vai su `Settings > Secrets and variables > Actions` nel tuo repository GitHub e aggiungi le variabili d'ambiente sopra elencate come "Secrets".

2. **Verifica `vite.config.ts`:**
   Assicurati che `base` sia impostato correttamente:
   ```typescript
   base: '/protocollo-spinta-tirata-2-0/'
   ```

3. **Esegui il deploy:**
   Puoi usare un'Action di GitHub o eseguire manualmente:
   ```bash
   npm run build
   # Carica il contenuto della cartella /dist sul ramo gh-pages
   ```

## 📱 Installazione PWA su iPhone (Safari)

Per un'esperienza ottimale, installa l'app sulla schermata home:

1. Apri l'URL dell'app in **Safari**.
2. Tocca l'icona **Condividi** (il quadrato con la freccia verso l'alto) nella barra in basso.
3. Scorri verso il basso e seleziona **"Aggiungi alla schermata Home"**.
4. Conferma toccando **"Aggiungi"** in alto a destra.

L'app apparirà ora sulla tua home screen senza la barra degli indirizzi del browser, proprio come un'app nativa.

---
Sviluppato con ❤️ per il Protocollo 2.0.
