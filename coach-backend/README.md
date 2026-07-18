# Pianote — backend du Prof de piano IA

Petit proxy qui parle au modèle IA à la place de l'app (la clé/le quota ne doivent jamais être dans l'app).
Tourne sur **Cloudflare Workers AI** : **gratuit, sans clé API, sans carte bleue**.

## Fichiers
- `worker.js` — le Worker Cloudflare (production). Appelle Workers AI via `env.AI`.
- `coach-core.mjs` — logique partagée : prompt système du prof, garde des messages, modèle.
- `dev-server.mjs` — serveur Node local qui renvoie des réponses **démo** (pour tester l'UI sans déployer).
- `wrangler.toml` — config du Worker + binding `AI`.

## Déployer (une fois le sous‑domaine workers.dev choisi)
```bash
npx wrangler deploy
```
La sortie affiche l'URL, du type `https://pianote-coach.<ton-sous-domaine>.workers.dev`.
Mets cette URL **+ `/coach`** dans `index.html` (constante `COACH_ENDPOINT`).

Aucune clé à configurer : Workers AI est fourni par le binding `AI`.

## Modèle
`@cf/meta/llama-3.3-70b-instruct-fp8-fast` (proche de Haiku, multilingue). Modifiable dans
`coach-core.mjs` → `MODEL`. Option plus légère pour étirer le quota gratuit :
`@cf/meta/llama-3.1-8b-instruct`.

## Quota
Le plan gratuit Cloudflare inclut une allocation quotidienne de Workers AI (sans carte). Au‑delà,
il faut le plan Workers Payant (~5 $/mois). Pour un lancement, le gratuit suffit.

## Tester en local
- Réponses démo : `node dev-server.mjs` (sert `:8787`).
- Vraies réponses Workers AI en local : `npx wrangler dev` (nécessite d'avoir déjà choisi le sous‑domaine).
