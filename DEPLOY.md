# Déploiement — Option A (front Vercel + backend & base sur Render)

Architecture : **React (Vercel)** → appelle l'**API Express (Render)** → **PostgreSQL (Render)**.

> Ordre important : Render **d'abord** (pour obtenir l'URL de l'API), puis Vercel,
> puis revenir régler le CORS sur Render.

---

## 1. Backend + base de données → Render

1. Le code est déjà sur GitHub (`phisha1/csiapp`).
2. Render → **New → Blueprint** → sélectionner le dépôt. Render lit `render.yaml`
   et crée **deux ressources** : la base `csi-cnam-db` et le service web `csi-cnam-api`.
3. Renseigner les **secrets** du service `csi-cnam-api` (onglet *Environment*) :
   - `JWT_SECRET` : une longue chaîne aléatoire.
   - `ENCRYPTION_KEY` : ≥ 16 caractères. ⚠️ **À fixer une fois pour toutes** — si elle
     change, les coordonnées bancaires déjà chiffrées deviennent illisibles.
   - `CORS_ORIGIN` : laisser vide pour l'instant (réglé à l'étape 3).
   - (`DATABASE_URL` est injectée automatiquement depuis la base.)
4. Déployer. Le build exécute `prisma generate`, compile, puis
   `prisma migrate deploy` (crée les 14 tables). Vérifier la **sonde** :
   `https://csi-cnam-api.onrender.com/api/health` → `{"status":"ok"}`.
5. **Comptes de démo** (base vide au départ) : onglet *Shell* du service →
   `npx tsx prisma/seed.ts` → crée `assureur` / `medecin` / `specialiste` (mdp `cnam2024`).
6. Noter l'URL de l'API, ex. `https://csi-cnam-api.onrender.com`.

## 2. Frontend → Vercel

1. Vercel → **New Project** → importer le dépôt. *Root Directory* = racine du dépôt ;
   framework **Vite** détecté automatiquement (`vercel.json` est déjà fourni).
2. Variable d'environnement :
   - `VITE_API_URL` = `https://csi-cnam-api.onrender.com/api` (l'URL Render + `/api`).
3. Déployer → noter l'URL du front, ex. `https://csiapp.vercel.app`.

## 3. Relier les deux (CORS)

1. Render → service `csi-cnam-api` → *Environment* → `CORS_ORIGIN` =
   `https://csiapp.vercel.app` (plusieurs URLs possibles, séparées par des virgules —
   utile pour les déploiements *preview* Vercel).
2. Redéployer le backend (ou *Manual Deploy → Clear cache*). C'est prêt.

---

## Points à connaître

- **Free tier Render** : le service s'endort après inactivité → premier appel lent
  (~50 s, « cold start »). La base PostgreSQL gratuite a une durée de vie limitée ;
  pour la durabilité, utiliser **Neon** (retirer le bloc `databases:` de `render.yaml`
  et fournir `DATABASE_URL` à la main).
- **Sauvegardes (BNF3)** : en production, s'appuyer sur les **sauvegardes automatiques**
  du fournisseur de base (Render/Neon). Le script `npm run backup` (pg_dump) est prévu
  pour le **local** uniquement.
- **PDF de facture** : le système de fichiers Render est éphémère → les PDF archivés sont
  régénérés à la demande (l'archivage ne survit pas à un redéploiement). Comportement
  acceptable pour une démo.
- **HTTPS** : fourni automatiquement par Vercel et Render (BNF1).
- **Variables backend** : voir `server/.env.example` pour la liste complète.
