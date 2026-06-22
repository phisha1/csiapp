# API CSI-CNAM (server)

Backend du Système d'Information CNAM — **Node.js + Express + Prisma + PostgreSQL**.
Projet tutoré ENSPY, Groupe 4. Couvre les besoins BF1–BF12 et BNF1–BNF7.

## Prérequis

- Node.js ≥ 18 (testé sur 24)
- PostgreSQL ≥ 14 (la machine de dev utilise PostgreSQL 18, en écoute sur `localhost:5432`)

## Installation

```bash
cd server
npm install
cp .env.example .env        # puis renseigner DATABASE_URL (mot de passe postgres) et JWT_SECRET
npm run prisma:generate     # génère le client Prisma
npm run prisma:migrate      # crée le schéma dans la base csi_cnam
npm run seed                # (optionnel) jeu de données de démonstration
```

> Avant la première migration, créer la base : `createdb -U postgres csi_cnam`
> (ou via pgAdmin / `CREATE DATABASE csi_cnam;`).

## Développement

```bash
npm run dev        # serveur avec rechargement à chaud (tsx)
npm run typecheck  # vérification TypeScript
npm test           # tests (vitest)
```

Sonde de santé : `GET http://localhost:4000/api/health`.

## Architecture (en couches — BNF4)

```
src/
├─ config/        env validé (zod), client Prisma
├─ middlewares/   gestion d'erreurs, auth JWT, RBAC, audit, rate-limit
├─ modules/       un dossier par domaine : routes → controller → service
├─ lib/           adaptateurs externes (banque, génération PDF)
├─ app.ts         montage Express
└─ server.ts      démarrage
prisma/
└─ schema.prisma  modèle de données (dérivé du rapport §1.1.3)
```
