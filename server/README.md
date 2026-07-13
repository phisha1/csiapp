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

## Contrôle d'accès médical

- **Assureur** : accès opérationnel aux dossiers nécessaires à la gestion des assurés et des remboursements.
- **Médecin généraliste** : accès à ses propres actes et aux patients dont il est le médecin traitant.
- **Médecin spécialiste** : accès à ses propres actes et aux patients qui lui ont été nominativement orientés.
- **Administrateur** : gestion des comptes uniquement, sans accès aux dossiers médicaux ni à l'annuaire professionnel.

Les listes et les lectures directes appliquent les mêmes filtres. Une ressource hors périmètre est présentée comme introuvable afin de ne pas divulguer son existence. Les réponses destinées aux médecins excluent les données bancaires, professionnelles et de remboursement.

## Protection des données sensibles

- Les numéros de compte, diagnostics, motifs, actes, suites et consignes d'ordonnance sont chiffrés en AES-256-GCM avant écriture en base.
- Les détails médicaux du journal d'audit sont chiffrés ; mots de passe, jetons, cookies et contacts y sont systématiquement masqués.
- En production, le serveur refuse de démarrer avec des secrets faibles, connus ou réutilisés, ainsi qu'avec une origine CORS non HTTPS.
- Après import d'une ancienne base, exécuter `npm run encrypt:phi` pour protéger les données héritées. La commande est idempotente.

`JWT_SECRET` et `ENCRYPTION_KEY` doivent être deux valeurs aléatoires distinctes d'au moins 32 caractères. Conserver `ENCRYPTION_KEY` dans le gestionnaire de secrets du déploiement : sa perte rend les données chiffrées illisibles.

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
