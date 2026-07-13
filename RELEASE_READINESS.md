# Préparation à la commercialisation

État au **13 juillet 2026** : **release candidate technique validée localement**.

Le produit peut être présenté à un client pilote sur un environnement maîtrisé. Il ne doit pas encore être vendu comme service de production pleinement opéré tant que les validations externes ci-dessous ne sont pas signées.

## Preuves techniques obtenues

- Frontend React : typecheck et build production réussis.
- API Express : typecheck applicatif et outils, build Prisma/TypeScript réussis.
- Tests backend : **68/68** réussis dans **20** fichiers.
- Dépendances de production : **0 vulnérabilité npm** détectée côté frontend et backend.
- Parcours navigateur : accueil, admin, assureur et médecin vérifiés sur desktop et mobile.
- Authentification : cookies HttpOnly, verrouillage, mot de passe temporaire, changement obligatoire et invalidation de session vérifiés.
- Données : les comptes QA ont été supprimés après la recette et aucun compte de démonstration n'a été ajouté au dépôt.
- Exploitation : sondes `/api/health` et `/api/ready`, sauvegarde/restauration et archivage chiffré des PDF sont documentés dans `DEPLOY.md`.

## Corrections de la recette finale

| Commit | Correction | Résultat |
| --- | --- | --- |
| `1e32d66` | Badge des feuilles alimenté par les statistiques réelles | Vérifié |
| `2b2da56` | Retrait du faux compteur de notifications | Vérifié |
| `f6cd7b8` | Paramètres réels et changement de mot de passe backend | Vérifié |

## Portes obligatoires avant première vente en production

- [ ] Déployer le commit retenu via la CI et conserver la preuve que les deux jobs sont verts.
- [ ] Vérifier le frontend et l'API sur leurs domaines HTTPS définitifs, y compris CORS, `/api/health` et `/api/ready`.
- [ ] Utiliser PostgreSQL managé avec sauvegardes automatiques, rétention définie et restauration testée dans une base isolée.
- [ ] Créer le premier administrateur avec `bootstrap:admin`, effectuer sa rotation de mot de passe et confirmer l'absence de comptes de démonstration.
- [ ] Configurer les alertes 5xx, disponibilité, sauvegarde et saturation, avec contacts d'astreinte désignés.
- [ ] Faire réaliser une recette métier par l'organisme client sur ses scénarios réels et consigner son acceptation.
- [ ] Faire réaliser un test d'intrusion indépendant avant traitement de données médicales réelles.
- [ ] Valider avec le conseil juridique local la politique de confidentialité, les durées de conservation, les contrats de sous-traitance, les droits des personnes et la procédure d'incident.
- [ ] Définir le support client, les engagements de service, la facturation, la réversibilité et la responsabilité opérationnelle.

## Verdict

- **Vendable comme pilote encadré : oui.**
- **Prêt à être déployé comme release candidate : oui.**
- **Prêt à accepter sans réserve des clients payants et des données médicales réelles : non, conditionné aux neuf portes ci-dessus.**

Le blocage restant n'est plus un défaut critique identifié dans le code local ; il concerne désormais la preuve de production, la sécurité indépendante, l'exploitation et le cadre contractuel.
