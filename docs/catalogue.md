# Catalogue de recettes

## Où il se trouve

La référence du catalogue est dans le dépôt :

- `catalog/ingredients.json` : les ingrédients, avec leur catégorie et leur `kashrut` ;
- `catalog/recipes.json` : les recettes ;
- `catalog/sources.json` : les sites d'où viennent les recettes.

Chaque recette a une catégorie (`course` : entrée, plat, accompagnement, dessert, petit-déjeuner), une annotation `kashrut` (viande/lait/neutre, בשרי/חלבי/פרווה) qui doit correspondre à ses ingrédients, et une `source` (id dans `sources.json` et lien vers la page d'origine). `image` peut être un chemin du site ou une URL ; sans photo (`null`), l'app affiche un cadre provisoire.

## Modifier le catalogue

1. Modifie les fichiers de `catalog/`.
2. Lance `npm test` : `src/catalog.test.ts` vérifie la cohérence (ingrédients connus, cacheroute, traductions…).
3. Pousse sur `main`. Le workflow `.github/workflows/catalog.yml` refait la vérification, puis envoie le catalogue dans Firestore (`scripts/seed-catalog.mjs`). Les documents qui ne sont plus dans les fichiers sont supprimés.

L'app suit les changements en direct.

## Importer des recettes de TheMealDB

`scripts/import-themealdb.mjs` ajoute au catalogue des recettes de [TheMealDB](https://www.themealdb.com), en trois temps. 331 recettes (`mealdb-<numéro>`) sont déjà importées et notées `approved` dans `imports/themealdb/drafts.json` : le script ne les retraduit pas.

Il faut un accès à `www.themealdb.com` et, pour l'étape 1, une clé Anthropic (https://console.anthropic.com, avec un peu de crédit). Ne mets jamais la clé dans un fichier du projet.

### 1. Brouillons

```bash
ANTHROPIC_API_KEY=... npm run import:themealdb
```

Récupère toutes les recettes et écarte celles qui ne sont pas kasher. Claude revérifie ensuite la cacheroute, traduit en français et en hébreu, découpe les étapes, estime le temps et la difficulté, et relie chaque ingrédient au catalogue. Les brouillons vont dans `imports/themealdb/drafts.json`, les recettes écartées dans `imports/themealdb/excluded.json` avec la raison. Relancer la commande ne traite que les nouvelles recettes.

Options (après `--`) :

- `--limit 5` : seulement quelques recettes, pour essayer ;
- `--dry-run` : récupérer et filtrer, sans Claude (gratuit) ;
- `--redo 52772` : refaire un brouillon.

Une ligne `[skip]` indique un problème (clé invalide, crédit épuisé…) ; la recette sera retentée au prochain lancement.

### 2. Relecture

```bash
npm run review:themealdb
```

Ouvre une page sur http://localhost:5174. Pour chaque brouillon, elle montre l'original anglais à côté de la traduction, avec les points à vérifier. Tu peux corriger titres, étapes, ingrédients, temps, portions et étiquettes, puis **Approuver** ou **Rejeter**. Tout est enregistré dans `drafts.json`. Une recette n'est approuvée que si elle est complète.

Le statut « Ingrédients manquants » signale des ingrédients absents du catalogue : ajoute-les à `catalog/ingredients.json` puis à la recette, ou refais le brouillon avec `--redo`.

Ne lance pas l'import pendant la relecture : il écraserait ce qui vient d'être approuvé.

### 3. Publication

```bash
npm run import:themealdb -- --publish
npm test
```

Copie les brouillons approuvés dans `catalog/recipes.json`, retire ceux qui ne sont plus approuvés, et refuse de publier s'il manque une traduction ou un ingrédient. Il suffit ensuite de pousser.

### Le filtre kasher

`scripts/themealdb/kosher.mjs` écarte le porc, les fruits de mer, les poissons sans écailles, le lapin, la gélatine, le suif, les saucisses sans précision, et tout mélange de viande et de lait ou de viande et de poisson. Il juge la composition de la recette, pas la certification des produits ni l'abattage. Ses tests sont dans `scripts/themealdb/kosher.test.mjs`.

La clé de test TheMealDB (`1`) sert par défaut. Pour une app publiée, mets ta clé dans `THEMEALDB_API_KEY`.

### En cas de problème

| Message | Cause probable |
| --- | --- |
| `TheMealDB answered 4xx/5xx` ou `fetch failed` | Pas d'accès à `www.themealdb.com`. |
| `authentication_error` | Clé Anthropic absente ou mal copiée. |
| `credit balance is too low` | Plus de crédit dans la console Anthropic. |
| `EADDRINUSE` au lancement de la relecture | La page tourne déjà. Ferme l'autre terminal, ou lance avec `PORT=5175`. |
| `Rien n'a été publié. Corrige d'abord…` | Une recette approuvée est incomplète ; le message dit laquelle. |
