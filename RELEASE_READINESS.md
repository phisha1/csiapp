# Préparation à la commercialisation

État au **13 juillet 2026** : **release candidate technique validée localement — 99/100**.

Le produit peut être présenté et vendu comme pilote encadré sur un environnement maîtrisé. Le score n'est pas 100/100, car une validation locale ne peut pas remplacer les preuves indépendantes, contractuelles et d'exploitation sur l'environnement de production réel.

## Score de préparation

| Domaine | Score | Preuve |
| --- | ---: | --- |
| Qualité du code et builds | 20/20 | Typecheck et builds frontend/backend réussis |
| Tests métier et sécurité | 20/20 | 22 tests frontend, 68 tests backend, dont 29 tests de sécurité ciblés |
| Parcours navigateur | 20/20 | 23 scénarios sur Chromium, Firefox, WebKit, Pixel 7 et iPhone 13 |
| Accessibilité et interface | 15/15 | Scan axe sans violation critique après correction du contraste |
| Sécurité applicative locale | 15/15 | 0 constat ouvert au seuil 8/10 ; 0 vulnérabilité npm de production |
| Production et validation indépendante | 9/10 | Procédures prêtes, preuves externes restant à obtenir |
| **Total** | **99/100** | **Release candidate locale** |

## Preuves techniques obtenues

- Frontend React : **22/22 tests**, typecheck et build de production réussis.
- API Express : **68/68 tests** dans 20 fichiers, typecheck applicatif et outils, build Prisma/TypeScript réussis.
- Sécurité ciblée : **29/29 tests** couvrant authentification, CSRF, chiffrement, accès médical, projections et cookies.
- Dépendances de production : **0 vulnérabilité npm** détectée côté frontend et backend.
- Matrice navigateur : **23/23 scénarios Playwright** réussis sur cinq profils desktop/mobile.
- Parcours métier complet : connexion assureur, remboursement d'une feuille validée, création de facture et vérification de l'archive PDF durable.
- PDF : type MIME, nom de fichier, signature `%PDF-`, taille minimale et empreinte SHA-256 stable vérifiés.
- Accessibilité : scan automatisé axe ; contraste WCAG corrigé pour les textes secondaires.
- Authentification : cookies HttpOnly, verrouillage, mot de passe temporaire, changement obligatoire et invalidation de session vérifiés.
- Sécurité applicative : 43 routes inventoriées, 3 publiques, 40 protégées ; les 6 constats de l'audit précédent sont résolus.
- Données : les fixtures métier E2E sont isolées, refusées en production et supprimées automatiquement après la recette.
- Exploitation : sondes `/api/health` et `/api/ready`, sauvegarde/restauration et archivage chiffré des PDF documentés dans `DEPLOY.md`.

## Corrections et automatisations finales

| Commit | Modification | Résultat |
| --- | --- | --- |
| `1e32d66` | Badge des feuilles alimenté par les statistiques réelles | Vérifié |
| `2b2da56` | Retrait du faux compteur de notifications | Vérifié |
| `f6cd7b8` | Paramètres réels et changement de mot de passe backend | Vérifié |
| `aae085d` | Base de tests frontend | 12 tests initiaux |
| `76a7653` | Parcours frontend critiques | 22 tests au total |
| `0867c4e` | Contraste des textes secondaires | Scan accessibilité validé |
| `a5d0e57` | QA navigateur multi-moteurs et mobile | 20 scénarios automatisés |
| `21cea22` | Remboursement jusqu'à l'archive PDF | 23 scénarios au total |
| `b9bf939` | Origine CORS locale alignée sur le port 5175 | Configuration cohérente |

## Ce qui manque pour 100/100

- [ ] Déployer le commit retenu via la CI et conserver la preuve que les deux jobs sont verts.
- [ ] Vérifier le frontend et l'API sur leurs domaines HTTPS définitifs, y compris CORS, `/api/health` et `/api/ready`.
- [ ] Tester une restauration réelle depuis PostgreSQL managé dans une base isolée et conserver le procès-verbal.
- [ ] Configurer et déclencher les alertes 5xx, indisponibilité, sauvegarde et saturation avec contacts d'astreinte.
- [ ] Faire réaliser une recette métier et signer l'acceptation par l'organisme client.
- [ ] Faire réaliser un test d'intrusion par un intervenant indépendant avant toute donnée médicale réelle.
- [ ] Valider avec le conseil juridique local la confidentialité, la conservation, la sous-traitance, les droits des personnes et la procédure d'incident.
- [ ] Vérifier le rendu sur Safari avec un appareil Apple réel ; WebKit automatisé reste un excellent proxy, pas une certification Safari/macOS.
- [ ] Finaliser les contrats, le support, les engagements de service, la facturation, la réversibilité et la responsabilité opérationnelle.

## Verdict commercial

- **Vendable comme pilote encadré : oui.**
- **Prêt à être déployé comme release candidate : oui.**
- **Prêt à accepter sans réserve des données médicales réelles : non, jusqu'à validation des portes externes ci-dessus.**

Le code local ne présente plus de défaut critique identifié. Le point manquant pour atteindre 100/100 est une preuve externe : production réelle, sécurité indépendante, acceptation client, exploitation et cadre juridique.

> Cet audit assisté ne remplace pas un audit de sécurité professionnel ni un test d'intrusion indépendant.
