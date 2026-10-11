# Firebase

Par défaut, l'app utilise le projet `resto-frigo`, dont les clés (publiques par nature) sont dans `.env.production`. Ce guide sert à brancher l'app sur un autre projet, ou à tout faire tourner en local.

## Tester en local avec les émulateurs

Sans toucher au vrai projet. Il faut Java ; `firebase-tools` est récupéré automatiquement au premier lancement.

```bash
npm run emulators       # Auth + Firestore en local, avec les règles de firestore.rules
npm run dev:emulators   # l'app branchée sur ces émulateurs
```

Pour avoir des recettes dans l'émulateur : `FIRESTORE_EMULATOR_HOST=127.0.0.1:8080 FIREBASE_PROJECT_ID=demo-restofrigo npm run seed:catalog`.

## Utiliser son propre projet Firebase

1. Crée un projet sur https://console.firebase.google.com.
2. **Authentication > Sign-in method** : active **Google**.
3. **Authentication > Settings > Authorized domains** : ajoute le domaine où l'app est hébergée (`localhost` est déjà autorisé).
4. **Project settings > Your apps** : ajoute une app **Web**, puis copie `.env.example` en `.env` et remplis-le avec `apiKey`, `authDomain`, `projectId` et `appId` :

   ```
   VITE_FIREBASE_API_KEY=...
   VITE_FIREBASE_AUTH_DOMAIN=mon-projet.firebaseapp.com
   VITE_FIREBASE_PROJECT_ID=mon-projet
   VITE_FIREBASE_APP_ID=...
   ```

5. **Build > Firestore Database** : **Créer une base de données**, dans une région proche (par exemple `europe-west1`, ou `me-west1` pour Israël), en **mode production**.
6. Publie les règles : `npx firebase-tools deploy --only firestore:rules --project <id-du-projet>` (ou copie `firestore.rules` dans l'onglet **Règles** de la console).
7. Envoie le catalogue : `GOOGLE_APPLICATION_CREDENTIALS=key.json FIREBASE_PROJECT_ID=<id-du-projet> npm run seed:catalog`, avec la clé d'un compte de service (ne la commite jamais : `key.json` est ignoré par git).

Avec Google, se connecter et s'inscrire passent par le même bouton : Firebase crée le compte à la première connexion, et l'app affiche alors « Ton compte est créé ». Si le navigateur bloque la pop-up, l'app passe par une redirection.

Tant que les clés ne sont pas renseignées, l'écran de connexion le signale et propose un **mode démo** sans compte.
