# Publier « Clavier » sur l'App Store

Ce guide part de l'état actuel du dépôt (app web + wrapper iOS Capacitor déjà configuré)
et va jusqu'à la soumission à Apple.

---

## 0) Ce qui est déjà fait ✅
- App web complète, **100 % hors-ligne** (Web Audio, aucun réseau) — atout clé pour l'App Review.
- **PWA** installable (manifest, service worker, icône) → déjà testable sur iPhone via
  Safari → Partager → « Sur l'écran d'accueil ». En ligne : https://apprendre-piano.netlify.app
- **Projet iOS Capacitor pré-configuré** : `package.json`, `capacitor.config.json`, build `www/`.
- **Icône d'app** générée (`icons/icon-1024.png` + tailles dérivées).
- **Meta iOS** (safe-area/notch, plein écran, barre d'état), **haptique native** au toucher des touches.
- **Politique de confidentialité** : `privacy.html` → https://apprendre-piano.netlify.app/privacy.html

## Prérequis (à ta charge)
1. **Compte Apple Developer Program** — 99 $/an — https://developer.apple.com/programs/
2. **Xcode complet** (Mac App Store, ~7 Go) — *pas seulement les Command Line Tools*.
   Puis : `sudo xcode-select -s /Applications/Xcode.app/Contents/Developer && xcodebuild -runFirstLaunch`
3. **CocoaPods** : `brew install cocoapods`  (ou `sudo gem install cocoapods`)

---

## 1) Générer le projet iOS
```bash
cd ~/piano-app
npm install
npm run ios:add          # construit www/ puis crée le dossier ios/ (lance pod install)
```
Choisis ton **identifiant d'app** unique (reverse-DNS que tu possèdes, ex. `com.tonnom.clavier`) :
édite `capacitor.config.json` → `"appId"`, puis :
```bash
npm run ios:sync
```

## 2) Icône & écran de lancement
```bash
mkdir -p resources
cp icons/icon-1024.png resources/icon.png
npx @capacitor/assets generate --ios --iconBackgroundColor '#e89a34' --splashBackgroundColor '#0f1117'
```
(Regénère automatiquement tout l'AppIcon set + le splash dans le projet Xcode.)

## 3) Configurer dans Xcode
```bash
npm run ios:open
```
Dans Xcode, cible **App** :
- **Signing & Capabilities** → coche « Automatically manage signing » → sélectionne ton **Team**.
- **General** → Display Name : `Clavier` · Version : `1.0` · Build : `1` · iOS Deployment Target : `14.0`.
- **Info** → ajoute la clé `ITSAppUsesNonExemptEncryption` = `NO` (évite la question sur le chiffrement).
- **Info** → ajoute `NSMicrophoneUsageDescription` (ex. « Le micro sert à transformer ce que tu fredonnes en notes »). **Obligatoire** : sans cette clé l'app crashe à l'ouverture du micro (fonction « Fredonner »).
- Choisis les orientations (Portrait suffit ; paysage possible).
- Lance sur un simulateur (▶) pour tester, puis sur ton iPhone.

## 4) Fiche App Store Connect
Sur https://appstoreconnect.apple.com → **Mes apps** → **+** :
- Nom : `Clavier` · Langue principale : Français · Bundle ID : celui de l'étape 1 · SKU : `clavier-001`.
- **Confidentialité** → « Les données ne sont pas collectées » (tout est local, aucun réseau).
- **URL de politique de confidentialité** : https://apprendre-piano.netlify.app/privacy.html
- **URL d'assistance** : https://apprendre-piano.netlify.app
- Catégorie : Éducation (secondaire : Musique) · Classement d'âge : 4+.
- **Captures d'écran** (obligatoires) : prends-les depuis le simulateur iPhone (6.7" et 6.5").
- Description, mots-clés, texte promotionnel.
- **Localisations** : l'app détecte la langue de l'appareil (FR/EN/ES/DE) et propose un sélecteur. Dans App Store Connect, ajoute une **localisation par langue** (nom, description, mots-clés traduits) pour la visibilité sur chaque marché. Le clavier MIDI est **masqué automatiquement sur iOS** (Web MIDI non supporté par Safari/WKWebView) — rien à configurer.

## 5) Archiver et soumettre
Dans Xcode :
- En haut, sélectionne la cible **« Any iOS Device (arm64) »**.
- Menu **Product → Archive**.
- Dans l'Organizer : **Distribute App → App Store Connect → Upload**.
- Reviens sur App Store Connect, attache le build à la version, puis **Soumettre pour révision**.

---

## ⚠️ Risque de rejet — Directive 4.2 (fonctionnalité minimale)
Apple refuse les apps qui ne sont « qu'un site web emballé ». Points en notre faveur, à
**mettre en avant dans les notes de révision** :
- Fonctionne **entièrement hors-ligne** (contenu embarqué, pas de chargement d'URL).
- **Audio natif** temps réel (synthèse Web Audio), **retour haptique** au jeu.
- Application **substantielle** : cours par niveaux, exercices, lecture de portée, enregistrement, etc.

Si besoin de renforcer encore : ajouter des notifications locales (rappel de pratique),
un widget, ou l'enregistrement audio exporté — dis-le et je l'ajoute.

## Mettre à jour l'app plus tard
Après toute modif de `index.html` :
```bash
npm run ios:sync     # reconstruit www/ et resynchronise le projet iOS
```
Puis, dans Xcode, incrémente le **Build**, ré-archive et re-soumets.
