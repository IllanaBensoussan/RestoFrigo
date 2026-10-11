# RestoFrigo

Cuisine avec ce qu'il y a vraiment dans ta cuisine. RestoFrigo garde ton frigo à jour en scannant tes tickets de caisse, et classe les recettes selon ce que tu peux déjà cuisiner.

**App en ligne : https://resto-frigo.web.app** (aussi disponible en [APK Android](docs/deploiement.md#app-android)).

## Ce que fait l'app

- **Connexion avec Google**, ou un mode démo sans compte.
- **Accueil** : état du frigo, recettes possibles, produits à utiliser vite, menu du jour.
- **Frigo** : produits par catégorie, triés par date de péremption.
- **Scanner** : photo, image ou PDF d'un ticket de caisse, ou ajout à la main. Chaque ligne lue est vérifiée avant d'entrer dans le frigo.
- **Recettes** : classées selon les ingrédients que tu as, puis selon ce qui périme en premier. Les ingrédients manquants s'ajoutent aux courses. Toutes les recettes sont kasher.
- **Menu de la semaine** : un déjeuner et un dîner par jour, et un bouton qui met aux courses tout ce qui manque.
- **Courses** : liste de courses partagée.
- **Foyer** : frigo, courses et menu partagés en direct entre plusieurs personnes, sur invitation.

Trois langues : français, anglais et hébreu (de droite à gauche).

## Démarrer

Il faut Node.js 20 ou plus récent.

```bash
npm install
npm run dev
```

L'app utilise le projet Firebase `resto-frigo` (clés publiques dans `.env.production`). Pour travailler sur ton propre projet Firebase ou en local avec les émulateurs, voir [docs/firebase.md](docs/firebase.md).

| Commande | Rôle |
| --- | --- |
| `npm run dev` | Lance l'app en local. |
| `npm test` | Lance les tests (lecteur de tickets, catalogue, filtre kasher…). |
| `npm run typecheck` | Vérifie les types TypeScript. |
| `npm run build` | Crée la version de production dans `dist/`. |
| `npm run emulators` / `npm run dev:emulators` | Firebase en local, et l'app branchée dessus. |
| `npm run import:themealdb` / `npm run review:themealdb` | Import de recettes TheMealDB. |
| `npm run seed:catalog` | Envoie le catalogue dans Firestore (normalement fait par la CI). |

## Organisation du dépôt

```
src/              L'app (React + TypeScript)
  ds/             Design system RestoFrigo : tokens et composants
  screens/        Un fichier par écran
  lib/            Logique : Firestore, foyer, lecture des tickets, menu, liens
catalog/          Ingrédients, recettes et sources (la référence, envoyée dans Firestore)
scripts/          Envoi du catalogue et import TheMealDB
imports/          Brouillons de l'import TheMealDB
public/           Fichiers servis tels quels (icône, liens Android)
android/          App Android (Trusted Web Activity)
firestore.rules   Règles de sécurité de Firestore
docs/             Documentation détaillée
```

## Documentation

- [Architecture et données](docs/architecture.md) : technologies, modèle Firestore, foyer et partage.
- [Firebase](docs/firebase.md) : configurer un projet, émulateurs locaux.
- [Catalogue de recettes](docs/catalogue.md) : modifier le catalogue, importer des recettes de TheMealDB.
- [Mise en ligne et Android](docs/deploiement.md) : workflows GitHub, secrets, APK.

## Travailler sur le projet

La branche principale est `main`. Chaque push sur `main` publie l'app sur https://resto-frigo.web.app. Les changements passent par une branche de travail et une pull request vers `main`.
