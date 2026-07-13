# Déploiement de production

Architecture retenue : **React sur Vercel → API Express sur Render → PostgreSQL géré sur Render**.

La configuration de production n’utilise aucun disque local pour les documents : les PDF de facture sont chiffrés puis archivés dans PostgreSQL. Ils suivent donc les sauvegardes de la base et survivent aux redéploiements.

## 1. Préparer Render

1. Créer le Blueprint depuis `render.yaml`.
2. Vérifier que le service web utilise au minimum le plan `starter` et PostgreSQL le plan `basic-256mb`. Les offres gratuites restent réservées aux démonstrations.
3. Renseigner dans le gestionnaire de secrets Render :
   - `JWT_SECRET` : valeur aléatoire d’au moins 32 caractères ;
   - `ENCRYPTION_KEY` : autre valeur aléatoire d’au moins 32 caractères ;
   - `CORS_ORIGIN` : URL HTTPS exacte du frontend ;
   - `RELEASE_SHA` : identifiant du commit ou du tag déployé.
4. Conserver `ENCRYPTION_KEY` dans un coffre de secrets séparé. Sa perte rend les données médicales, bancaires et les PDF archivés illisibles.
5. Déployer. Render exécute `npm ci`, compile, applique les migrations avec `prisma migrate deploy`, puis contrôle `/api/ready`.

Les sondes ont deux rôles distincts :

- `/api/health` confirme que le processus Node répond ;
- `/api/ready` confirme aussi que PostgreSQL répond et peut recevoir du trafic.

## 2. Initialiser les données

Le seed normal ne crée plus de comptes :

```bash
cd server
npm run seed
```

Il ajoute uniquement les spécialités et le catalogue de médicaments.

Pour créer le premier administrateur, définir temporairement `ADMIN_LOGIN` et `ADMIN_INITIAL_PASSWORD` dans l’environnement du service, exécuter puis supprimer immédiatement ces deux variables :

```bash
npm run bootstrap:admin
```

Le mot de passe initial doit avoir au moins 12 caractères, avec majuscule, minuscule et chiffre. Il expire et doit être changé à la première connexion. Le bootstrap refuse de créer un deuxième administrateur.

`npm run seed:demo` est exclusivement local. Il est bloqué lorsque `NODE_ENV=production` et génère des mots de passe aléatoires à usage unique.

## 3. Déployer le frontend Vercel

1. Importer le dépôt dans Vercel, à la racine.
2. Définir obligatoirement `VITE_API_URL`, par exemple `https://api.exemple.cm/api`.
3. Déployer puis reporter l’URL HTTPS exacte du frontend dans `CORS_ORIGIN` sur Render.

Un build de production échoue volontairement si `VITE_API_URL` manque, n’utilise pas HTTPS ou ne se termine pas par `/api`. Cela évite de livrer un frontend qui appelle `localhost`.

Pour une offre commerciale, utiliser de préférence deux sous-domaines du même domaine, par exemple `app.exemple.cm` et `api.exemple.cm`.

## 4. Sauvegardes et restauration

La protection principale est la sauvegarde gérée de PostgreSQL. Activer la rétention et la restauration à un instant donné proposées par l’offre choisie. Une sauvegarde qui n’a jamais été restaurée n’est pas une preuve de reprise.

Un exercice de restauration doit être réalisé au moins une fois par mois dans une base isolée :

1. restaurer la dernière sauvegarde dans une base temporaire ;
2. appliquer les migrations si nécessaire ;
3. vérifier les nombres de comptes, assurés, feuilles, remboursements, factures et documents PDF ;
4. ouvrir un PDF archivé ;
5. consigner la date, la durée et le résultat ;
6. supprimer la base temporaire après validation.

Les scripts locaux utilisent le format PostgreSQL `custom` et créent un checksum SHA-256 :

```bash
cd server
npm run backup
npm run backup:verify
```

Pour un exercice sur une base isolée :

```bash
RESTORE_DATABASE_URL="postgresql://.../csi_cnam_restore" \
RESTORE_CONFIRM_DATABASE="csi_cnam_restore" \
npm run backup:restore -- backups/csi_cnam_DATE.dump --confirm
```

Le script refuse de restaurer dans la base source et exige le nom exact de la base cible. Les dumps contiennent des données personnelles : les stocker uniquement dans un espace chiffré avec accès restreint.

## 5. Supervision et incident

Configurer au minimum :

- une alerte lorsque `/api/ready` échoue pendant deux contrôles consécutifs ;
- une alerte sur les réponses HTTP 5xx ;
- la conservation des journaux selon la politique de l’organisme ;
- une vérification quotidienne de la dernière sauvegarde réussie.

Chaque réponse contient `X-Request-Id`. Les journaux JSON de l’API reprennent cet identifiant sans enregistrer le corps des requêtes, ce qui permet de retrouver une erreur sans recopier les données médicales dans les logs.

En cas d’incident :

1. suspendre les déploiements et noter `RELEASE_SHA` ;
2. déterminer si l’API, PostgreSQL ou le frontend est touché ;
3. restaurer la dernière version applicative saine si le problème vient du code ;
4. restaurer PostgreSQL dans une base isolée avant toute bascule ;
5. ne jamais remplacer `ENCRYPTION_KEY` pendant une restauration ;
6. documenter l’heure, l’impact, les actions et la validation finale.

## 6. Contrôle avant ouverture commerciale

- CI verte sur le commit déployé.
- `/api/health` et `/api/ready` répondent en HTTPS.
- Première connexion administrateur et changement du mot de passe testés.
- Aucun compte de démonstration présent.
- Création puis réouverture d’un PDF après redéploiement validées.
- Sauvegarde récente et exercice de restauration documenté.
- Alertes et contacts d’astreinte définis.
- Domaine, politique de confidentialité et durée de conservation des données validés.
