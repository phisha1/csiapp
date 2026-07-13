# Tests

## Philosophie

La couverture à 100 % reste l’objectif. Les tests permettent de modifier rapidement le produit sans transformer chaque livraison en pari.

## Outils

- Vitest exécute les tests unitaires et de composants.
- Testing Library vérifie les composants du point de vue de l’utilisateur.
- jsdom fournit l’environnement navigateur léger des tests frontend.

## Commandes

```bash
npm test
npm run test:watch
npm run test:e2e
npm run test:e2e:headed
npm run typecheck
```

## Couches

- Tests unitaires : fonctions de formatage, validation et règles métier, fichiers `*.test.ts` proches du code testé.
- Tests de composants : interactions visibles, formulaires et états d’erreur, fichiers `*.test.tsx`.
- Tests d’intégration : échanges entre le store, les composants et un client API simulé.
- Tests navigateur : parcours dans Chromium, Firefox et WebKit, avec profils bureau et mobile, sous `e2e/`.
- Accessibilité : scans axe automatisés sur les règles WCAG A et AA détectables par un outil.

Avant le premier lancement local des tests navigateur :

```bash
npx playwright install chromium firefox webkit
```

## Conventions

- Décrire le comportement métier attendu, pas les détails internes de React.
- Utiliser des assertions précises sur le résultat visible ou la règle calculée.
- Réinitialiser les données globales après chaque test.
- Ajouter un test de régression avec chaque correction de comportement.
- Tester les deux branches de chaque nouvelle condition.
- Ne jamais valider un commit avec une suite de tests existante en échec.
