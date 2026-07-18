# App Store Connect — Abonnement « Prof de piano IA »

À créer dans : **App Store Connect → ton app → Monétisation → Abonnements**.
Copie‑colle chaque champ ci‑dessous.

---

## 1) Groupe d'abonnement (à créer en premier)
- **Nom de référence** (interne) : `Pianote Premium`
- **Nom d'affichage localisé** (visible par l'utilisateur) : `Pianote Premium` (identique dans les 5 langues, ou traduis si tu veux)

## 2) L'abonnement
- **Nom de référence** (interne) : `Prof IA mensuel`
- **ID de produit** : `com.pianote.app.coach.monthly`  ⚠️ doit correspondre **exactement** (déjà dans le code)
- **Durée** : `1 mois` (auto‑renouvelable)
- **Prix** : base **5,99 € (France)** → App Store Connect génère automatiquement les prix des autres régions. (Tu peux ajuster région par région ensuite.)

## 3) Localisations de l'abonnement
Limites Apple : **Nom d'affichage ≤ 30 caractères · Description ≤ 45 caractères.**

| Langue | Nom d'affichage | Description |
|--------|-----------------|-------------|
| 🇫🇷 Français | `Prof de piano IA` | `Ton coach piano personnel, 24h/24.` |
| 🇬🇧 English | `AI Piano Teacher` | `Your personal piano coach, 24/7.` |
| 🇪🇸 Español | `Profesor de piano IA` | `Tu coach de piano personal, 24/7.` |
| 🇩🇪 Deutsch | `KI-Klavierlehrer` | `Dein persönlicher Klavier-Coach, 24/7.` |
| 🇨🇳 中文（简体） | `AI 钢琴老师` | `你的私人钢琴教练，全天候。` |

## 4) Informations de révision (obligatoire)
- **Capture d'écran** : une image du **paywall** (onglet « Prof IA » → après 3 questions gratuites, l'écran « Débloque ton prof de piano IA »). C'est requis pour la validation Apple.
- **Notes de révision** (facultatif, à coller) :
  > The AI Piano Teacher is an optional add‑on. Tapping "Prof IA" gives 3 free questions; after that, this auto‑renewable monthly subscription unlocks unlimited coaching. To test: open the "Prof IA" tab, send 3 messages, then the paywall appears.

## 5) (Optionnel mais recommandé) Offre d'essai gratuit
Pour booster la conversion, ajoute une **offre d'introduction** :
- Type : **Essai gratuit** · Durée : **1 semaine** · Cible : nouveaux abonnés.
(Se configure dans l'abonnement → « Offres d'introduction ».)

---

## Après avoir créé l'abonnement
1. Assure‑toi que l'ID est **exactement** `com.pianote.app.coach.monthly`.
2. Test en simulateur possible **sans attendre la validation** grâce au fichier `ios/App/App/Pianote.storekit` (voir SHIP.md → étape 3).
3. Pour la vraie soumission : joins l'abonnement à la version de l'app, et garde la confidentialité en « **Aucune donnée collectée** » (l'appel au coach passe par ton backend, sans compte utilisateur).

## Rappels techniques (déjà en place)
- Backend en ligne : `https://pianote-coach.pianote.workers.dev/coach` (Cloudflare Workers AI, gratuit).
- Plugin d'achat installé (`cordova-plugin-purchase`), déblocage géré dans le code (`Sub` / paywall).
- Modèle IA : `@cf/meta/llama-3.3-70b-instruct-fp8-fast` (modifiable dans `coach-backend/coach-core.mjs`).
