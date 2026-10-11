# Architecture et données

## Technologies

- Vite + React 18 + TypeScript.
- Firebase : Auth (connexion Google) et Firestore (données, synchronisation en direct, cache hors ligne).
- Lecture des tickets : les PDF passent par `pdfjs-dist` (texte du PDF), les photos par `tesseract.js` (OCR français, anglais et hébreu). Les deux bibliothèques ne se chargent qu'au moment d'un scan ; Tesseract télécharge son moteur et ses langues depuis un CDN au premier scan.
- Les composants du design system **RestoFrigo** (Claude Design) sont dans `src/ds/` : `Button`, `ExpiryBadge`, `IngredientChip`, `PantryItem`, `ReceiptScan`, `ReceiptLine`, `MatchMeter`, `RecipeCard`, `TabBar`.

## Données d'un foyer

Avec un compte Google, le frigo, les courses, le menu et la date du dernier ticket appartiennent à un **foyer**, partagé par ses membres :

| Chemin Firestore | Contenu |
| --- | --- |
| `households/{id}` | `owner` (la personne qui l'a créé ; l'id du foyer est son uid), `lastReceiptAt`, `invite` (le code du lien d'invitation actuel). |
| `households/{id}/members/{uid}` | Un document par membre (nom, photo, date d'arrivée). |
| `households/{id}/pantry/{id}` | Un document par produit du frigo. |
| `households/{id}/shopping/{id}` | Un document par article de courses (`addedBy` : qui l'a ajouté). |
| `households/{id}/menu/{id}` | Les repas prévus du menu de la semaine. |
| `users/{uid}` | `householdId`, le foyer de la personne. |
| `invites/{code}` | Le foyer qui a créé ce code. |

Tout se synchronise en direct entre les membres et leurs appareils. L'app continue de marcher hors ligne grâce au cache de Firestore, puis rattrape à la reconnexion. Les règles (`firestore.rules`) n'autorisent que les membres d'un foyer à le lire et à le modifier.

À la première connexion, chacun reçoit son propre foyer, rempli avec ce qui était déjà enregistré (l'ancien emplacement `users/{uid}/pantry` et `users/{uid}/shopping`, ou à défaut le navigateur). Le mode démo reste dans le navigateur, sans foyer.

## Partage

- **Foyer** : dans **Compte** (ou **Partager la liste** dans Courses), **Inviter quelqu'un** envoie un lien `/foyer/{code}`. La personne qui l'ouvre se connecte avec Google et rejoint le foyer ; si elle avait déjà des produits, l'app propose de les apporter au frigo commun, et elle quitte son foyer précédent. La personne qui a créé le foyer peut retirer un membre (il retrouve son propre foyer) et **changer le lien d'invitation** (l'ancien ne marche plus). Les autres membres peuvent **quitter le foyer**.
- **Courses** : quand quelqu'un d'autre ajoute un article, un message l'annonce. **Ranger les achetés au frigo** met les articles cochés dans le frigo du foyer.
- **Recette** : **Partager** envoie un lien `/recette/{id}`, qui ouvre la recette dans l'app (après connexion si besoin).

Ces liens marchent grâce à la réécriture de `firebase.json`, qui sert l'app à toutes les adresses. Sur téléphone, le bouton ouvre le menu de partage (WhatsApp, SMS…) ; sinon il copie le lien.

## Catalogue

Les ingrédients, les recettes et leurs sources sont dans Firestore (collections `ingredients`, `recipes`, `sources`). L'app n'en contient aucune copie. Tout compte connecté peut les lire ; seul le script d'envoi peut les modifier. Voir [catalogue.md](catalogue.md).
