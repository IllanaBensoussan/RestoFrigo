# Mise en ligne et Android

## Workflows GitHub

| Workflow | Quand | Ce qu'il fait |
| --- | --- | --- |
| `.github/workflows/deploy.yml` | Chaque push sur `main` | Tests, build, publication des règles `firestore.rules`, puis de l'app sur **https://resto-frigo.web.app**. |
| `.github/workflows/catalog.yml` | Push sur `main` qui touche `catalog/` | Vérifie le catalogue et l'envoie dans Firestore. |
| `.github/workflows/android.yml` | Push sur `main` qui touche `android/`, ou à la demande | Construit l'APK et le publie dans la release **android**. |

Les trois peuvent aussi se lancer à la main depuis l'onglet **Actions**.

## Secrets GitHub

À ajouter une seule fois dans **Settings > Secrets and variables > Actions** :

- `FIREBASE_SERVICE_ACCOUNT` : la clé JSON d'un compte de service Google Cloud qui a les rôles **Administrateur Firebase Hosting** (mise en ligne), **Administrateur Firebase Rules** et **Consommateur Service Usage** (règles), et **Utilisateur Cloud Datastore** (envoi du catalogue).
- `ANDROID_KEYSTORE_BASE64` : la clé `restofrigo.jks` encodée en base64 (`base64 -w0 restofrigo.jks`).
- `ANDROID_KEYSTORE_PASSWORD` : son mot de passe.

Sans les secrets Android, l'APK sort non signé.

## App Android

Le dossier `android/` contient une app Android (Android 16 et plus) qui ouvre **https://resto-frigo.web.app** en plein écran dans une Trusted Web Activity. Chaque mise à jour du site arrive donc dans l'app sans nouvel APK. La connexion Google, l'appareil photo et l'import de tickets marchent comme sur le site.

Le dernier APK se télécharge dans la release GitHub **android**.

Garde précieusement la clé `restofrigo.jks` : toutes les mises à jour de l'app doivent être signées avec elle. Son empreinte SHA-256 est déclarée dans `public/.well-known/assetlinks.json` ; c'est ce fichier qui permet à Android d'afficher le site sans barre d'adresse.
