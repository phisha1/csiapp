# Handoff : Système d'Information pour un Organisme de Sécurité Sociale (Projet CSI — ENSPY)

## Overview
Application web d'administration pour un organisme de sécurité sociale / assurance maladie
(contexte camerounais, CNAM). Elle couvre l'inscription des assurés, l'affectation de médecins
traitants, la création et la complétion des feuilles de maladie, les prescriptions, les
remboursements (espèces / virement bancaire), la facturation, et un **explorateur UML** pédagogique
qui relie chaque écran aux diagrammes du rapport d'analyse/conception.

Deux rôles : **Assureur** (agent de sécurité sociale) et **Médecin**. La navigation et les cas
d'utilisation visibles dépendent du rôle connecté. Un **panneau latéral droit « Traçabilité UML »**
(repliable, masqué par défaut) explique, pour l'écran courant : acteur(s), cas d'utilisation,
préconditions, scénario nominal, scénarios alternatifs, classes/entités, changement d'état.

Toute l'interface est **en français**.

## About the Design Files
Le fichier livré (`Systeme-CSI.dc.html`) est une **référence de design réalisée en HTML** : un
prototype interactif montrant l'apparence et le comportement visés. **Ce n'est pas du code de
production à copier tel quel.** Le format `.dc.html` est un format propriétaire de prototypage
(streaming + template + classe de logique) ; ne cherche pas à le réutiliser directement.

La tâche est de **recréer ces écrans dans l'environnement du codebase cible** (React, Vue, Angular,
SwiftUI, etc.) en suivant ses patterns et bibliothèques établis. Si aucun environnement n'existe
encore, choisir le framework le plus approprié — **recommandation : React + TypeScript + Vite**,
avec un état applicatif simple (Context/Zustand) puisque le prototype est entièrement piloté par
un état local. Le backend (API REST) est à définir : les entités et opérations sont décrites dans
la section « State Management » et « Modèle de données (UML) ».

Pour ouvrir le prototype et voir le rendu : ouvrir `Systeme-CSI.dc.html` dans le même outil de
design que celui où il a été créé. (Hors de cet outil, le `.dc.html` ne s'affiche pas seul.)

## Fidelity
**Haute-fidélité (hifi).** Couleurs, typographie, espacements et interactions sont définitifs.
Recréer l'UI au pixel près en utilisant les bibliothèques/patterns du codebase. Les données sont
fictives (échantillon) — à remplacer par de vraies données via API.

---

## Design Tokens

### Couleurs
| Rôle | Hex |
|---|---|
| Navy primaire (texte fort, boutons, sidebar) | `#14253f` |
| Navy profond (dégradés) | `#0e1c30` / `#11233e` |
| Navy clair (hover boutons, dégradés) | `#1d3357` / `#1b3358` |
| Bordeaux (accent médecin / secondaire) | `#7d2433` (hover `#93283a`) |
| Orange ENSPY (accent, badges actifs, logo) | `#e07b1f` (foncé `#c2611a`) |
| Bleu (système bancaire, badges « émise/complétée ») | `#2c4a86` |
| Vert succès (remboursé, validé, actif) | `#1f8a4c` |
| Ambre (en attente) | `#9a7611` |
| Texte principal | `#1c2733` / `#2c3a52` |
| Texte secondaire | `#69748a` |
| Texte atténué / placeholders | `#94a0b2` |
| Fond application (zone centrale) | `#eceff3` |
| Fond cartes | `#ffffff` |
| Fond doux (lignes, champs désactivés) | `#f7f9fc` / `#f3f6fb` |
| Bordures | `#e6eaf0` / `#e3e8ef` / `#d3dae4` (inputs) |
| Sidebar fond | `#11233e` ; texte `#aebbcf` ; libellé section `#5d6f8e` |

### Badges de statut (fond / texte / bordure)
| Statut | Fond | Texte | Bordure |
|---|---|---|---|
| Créée | `#fdf0e3` | `#b9650f` | `#f0d3ad` |
| Complétée / Émise | `#e8eefb` | `#2c4a86` | `#cfdcf4` |
| En attente | `#fdf6e3` | `#9a7611` | `#eedfb0` |
| Remboursée / Remboursé / Validé / Actif | `#e6f4ec` | `#1f8a4c` | `#bfe3cd` |
| Rejetée / Échec | `#fbecec` | `#8b2231` | `#e7c3c8` |
Badge : `border-radius: 20px; padding: 3px 10px; font-size: 12px; font-weight: 600;`

### Typographie
- **UI / corps** : `IBM Plex Sans` (400/500/600/700).
- **Titres institutionnels, en-têtes d'écran, facture, ordonnance** : `IBM Plex Serif` (500/600/700).
- **Codes, identifiants, attributs UML, montants techniques** : `IBM Plex Mono` (400/500/600).
- Échelle : titre écran 17px/600 serif ; titre section 15–16px/600 ; KPI 27px/700 serif ;
  corps 13–14px ; labels 12.5px/600 ; libellés table en-tête 11px/600 majuscules `letter-spacing:.05em`.

### Espacement & formes
- Rayons : cartes `13–14px` ; boutons/inputs `9px` ; petites puces/champs `8px` ;
  badges/pills `20–40px` ; facture `8px`.
- Paddings cartes : `16–26px`. Gaps grilles : `12–20px`.
- Ombres : cartes au hover `0 8px 22px rgba(20,37,63,.1)` ; modale `0 24px 60px rgba(0,0,0,.3)` ;
  toast `0 12px 32px rgba(0,0,0,.22)` ; facture `0 10px 30px rgba(20,37,63,.08)`.
- Sidebar largeur `248px` ; header hauteur `62px` ; panneau UML largeur `360px`.

### Animations (keyframes)
- `csiFade` : opacity 0→1 + translateY(8px)→0, ~`.35s ease` (entrée d'écran).
- `csiPanel` : translateX(18px)→0 (ouverture panneau UML).
- `csiPop` : scale(.96)→1 (modale, toasts, confirmations).
- `csiFlow` : barre de progression du virement (boucle 1.2s linéaire).
- Transitions hover boutons/cartes : `.15–.18s`.

---

## Screens / Views

> Navigation par état `screen`. Sidebar filtrée par rôle. Header : fil d'ariane + titre d'écran
> (serif) + cloche notifications (badge `3`) + bouton bascule « Traçabilité UML ».

### 0. Authentification (`auth`)
- **But** : se connecter ou s'inscrire (agent ou médecin). Point d'entrée de toute l'app.
- **Layout** : deux colonnes. Gauche 42% : panneau navy en dégradé (logo « C » orange, « République
  du Cameroun / CNAM », titre du projet en serif 38px, sous-texte, crédit ENSPY, cercles décoratifs).
  Droite : carte centrée max-width 420px.
- **Onglets** : segmented control « Connexion » / « Inscription » (fond `#e7ebf1`, onglet actif blanc
  avec ombre).
- **Connexion** : sélecteur de rôle (2 cartes cliquables Assureur 🛡️ / Médecin 🩺, état actif =
  bordure 2px navy + fond `#f3f6fb`), champ Identifiant, champ Mot de passe, message d'erreur
  (encart rouge `csiPop`), bouton « Se connecter → » (navy pleine largeur). Aide démo affichée.
  - **Validation** : champs vides → « Veuillez renseigner l'identifiant et le mot de passe. » ;
    identifiants incorrects → « Identifiants incorrects… ». Comptes démo :
    `assureur` / `cnam2024` et `medecin` / `cnam2024` (rôle doit correspondre).
- **Inscription** : sélecteur de rôle, champs Nom, Prénom, Matricule (libellé adaptatif :
  « Matricule agent » `AG-2024-…` ou « Numéro d'ordre (ONMC) » `CM-MED-…`), E-mail, Mot de passe,
  Confirmer ; bouton « Créer le compte » (bordeaux). Soumission → écran de confirmation (coche verte)
  → « Continuer vers la connexion ».

### 1. Tableau de bord — Assureur (`dashboard`, rôle assureur)
- Salutation « Bonjour, A. Ngono » + date ; bouton « ＋ Inscrire un assuré ».
- **5 cartes KPI** (cliquables, hover translateY) : Assurés enregistrés (1 248, +24), Feuilles en
  attente (37), Remboursements effectués (892), Factures générées (874), Médecins enregistrés (64).
  Chaque carte : icône emoji + pastille couleur d'accent + valeur 27px serif + libellé + delta.
- **Processus métier principal** (carte) : 6 étapes cliquables en flux horizontal avec flèches « → » :
  Inscription assuré → Médecin traitant → Feuille de maladie → Complétion → Remboursement → Facture.
  Chaque étape : numéro (rond navy), acteur (majuscules), libellé. Clic → ouvre l'écran + le panneau UML.
- **Table « Feuilles de maladie récentes »** : Code (mono), Assuré, Médecin, Montant, État (badge).

### 2. Tableau de bord — Médecin (`dashboard`, rôle médecin)
- Salutation « Bonjour, Dr. Atangana ».
- **4 cartes KPI** : Consultations du jour (08), Feuilles créées (124), Prescriptions récentes (46),
  Orientations spécialistes (11).
- **Consultations du jour** (carte gauche, ~1.4fr) : 3 lignes (heure en pastille mono, patient, motif,
  badge Terminée/En cours/À venir).
- **Actions rapides** (carte droite) : 3 boutons → Enregistrer une feuille de maladie (navy plein),
  Prescrire un médicament, Prescrire une consultation spécialiste.

### 3. Listes (tables, fond carte blanche, en-têtes `#f7f9fc`)
Toutes : barre d'outils (recherche + filtres + boutons d'action) au-dessus d'une table.
- **Assurés** (`assures`) : barre recherche + filtre statut + boutons « Affecter médecin traitant »
  et « ＋ Inscrire un assuré ». Colonnes : Identifiant (mono), Assuré, Sexe, Profession, Groupe (mono),
  Médecin traitant, Statut (badge).
- **Médecins** (`medecins`) : recherche. Colonnes : N° Ordre, Médecin, Type (badge Généraliste bleu /
  Spécialiste bordeaux), Spécialité, Établissement, Patients.
- **Feuilles de maladie** (`feuilles`) : recherche + filtre état + boutons « Compléter une feuille » et
  « ＋ Enregistrer une feuille ». Colonnes : Code, Assuré, Médecin, Date, Diagnostic, Montant, État.
- **Consultations** (`consultations`, médecin) : N°, Patient, Date, Motif, Type, Suite.
- **Prescriptions** (`prescriptions`, médecin) : boutons « Consultation spécialiste » / « ＋ Prescrire
  un médicament ». Colonnes : N°, Patient, Médecin, Date, Type (badge), Détail.
- **Remboursements** (`remboursements`) : bouton « ＋ Effectuer un remboursement ». Colonnes :
  Référence, Assuré, Feuille, Montant, Taux, Mode, Statut (badge).
- **Factures** (`factures`) : bouton « Imprimer une facture ». Colonnes : N° Facture, Assuré, Feuille,
  Montant remboursé, Date, Statut, action « Voir ».

### 4. Inscrire un assuré (`assure_new`) — multi-étapes
- Layout 2 colonnes : formulaire (gauche) + panneau collapsible « Spécification du cas d'utilisation »
  (droite, `<details open>` : Préconditions / Postconditions / Scénario nominal / Scénarios alternatifs).
- **Stepper horizontal 4 étapes** (ronds : vert = fait `✓`, navy = actif, gris = à venir) :
  1. **Informations personnelles** : Nom, Prénom, Date de naissance, Sexe, Groupe sanguin, Téléphone.
  2. **Informations professionnelles** : Profession, Employeur, Matricule employeur, Revenu mensuel
     + encart alternatif rouge (doublon potentiel).
  3. **Validation** : récap clé/valeur + encart vert « données valides ».
  4. **Confirmation** : coche verte + identifiant généré `ASS-2024-0149` (chip pointillé mono).
- Boutons Précédent / Suivant / Valider et confirmer / Terminer (selon l'étape).

### 5. Affecter un médecin traitant (`assure_medecin`) — séquence + modale
- Carte 1 : recherche assuré par identifiant (préfill `ASS-2024-0142`) + bouton Rechercher.
- Après recherche : carte profil assuré (avatar initiales, infos, badge « Sans médecin traitant ») +
  carte « Sélectionner un médecin généraliste » : radios. **Validations illustrées** : généralistes
  sélectionnables ; un spécialiste (Dr. Mballa) est **désactivé** avec badge rouge « non éligible ».
- Bouton « Associer le médecin traitant » → **modale de confirmation** (`csiPop`, overlay
  `rgba(17,35,62,.5)`) → confirmation → toast.

### 6. Enregistrer une feuille de maladie (`feuille_new`) — médecin
- 2 colonnes : formulaire + carte « Contrôles de validation ».
- Champs : Numéro assuré (mono), Date consultation, Médecin (désactivé), Montant des soins,
  Diagnostic, Actes réalisés, Prescriptions associées, Observations (textarea).
- **Contrôles** (4 lignes avec `✓`) : Patient existant, Champs obligatoires, Format des données,
  Absence de doublon. Note sur le blocage en cas d'échec.
- Soumission → écran succès centré : coche verte + référence générée `FM-2024-0892` (état initial
  **Créée**) + boutons « Nouvelle feuille » / « Compléter → ».
- ⚠️ **Bug historique corrigé** : l'affichage formulaire vs succès se pilote par `feuilleSubmitted`
  ET sa négation `feuilleNotSubmitted` (ne pas tester deux fois la même valeur).

### 7. Compléter une feuille de maladie (`feuille_complete`) — assureur
- Carte recherche par code (préfill `FM-2024-0890`) + rappel des **états alternatifs gérés** (chips) :
  Feuille introuvable / Déjà remboursée / Données invalides.
- Après recherche : 2 colonnes — détails de la feuille (avec badge Créée) + formulaire remboursement
  (Taux, Montant remboursé, Mode de paiement radios Espèces/Virement) + bouton « Compléter la feuille ».
  Transition d'état : **Créée → Complétée**.

### 8. Effectuer le remboursement (`remboursement_new`) — workflow guidé 6 étapes
- Stepper 6 colonnes (Assuré, Dossier, Mode, Montant, Confirmer, Mise à jour).
  1. Identifier l'assuré (préfill + carte profil).
  2. Choisir le dossier (radio feuille complétée).
  3. **Choisir le mode** : 2 grandes cartes distinctes — **Espèces 💵** (bordure verte si choisi) /
     **Virement bancaire 🏦** (bordure bleue si choisi).
  4. Vérifier le montant : récap soins / taux / montant à rembourser (vert) + encart « cohérent ».
  5. **Confirmation** : si **virement** → carte « Système bancaire — Service externe » avec statut
     (En attente → Traitement… barre `csiFlow` → Validé ✓) déclenché par « Initier le virement »
     (≈1.6s). Si **espèces** → carte verte sans interaction bancaire.
  6. Succès : transition d'état visible **Complétée → Remboursée** (deux chips + flèche).
- Boutons Précédent/Suivant ; « Confirmer le remboursement ✓» ; « Générer la facture → ».

### 9. Imprimer une facture (`facture_print`)
- Barre d'actions : « ↻ Générer la facture », « 🖨 Imprimer », « ⬇ Télécharger PDF ».
- Document centré (max 720px) : **en-tête institutionnel** navy dégradé (logo, République du Cameroun /
  CNAM, N° facture mono `FACT-2024-0302`) ; **infos assuré** + **références** (feuille, date, mode) ;
  **table** Désignation/Montant (Montant des soins, Taux, **Montant remboursé** surligné vert) ;
  pied : mention légale + zone **Signature / Cachet** (cadre pointillé) + « L'Agent — A. Ngono ».

### 10. Prescrire des médicaments (`prescrire_medicament`) — médecin
- 2 colonnes : formulaire + **aperçu ordonnance** en direct (en-tête médecin serif, lignes `℞`).
- Sélecteurs Patient / Consultation. **Lignes de médicaments** dynamiques (bouton « ＋ Ajouter »,
  croix pour retirer) : Médicament, Code (mono), Posologie, Durée, Instructions. L'aperçu se met à
  jour en temps réel (binding par ligne). Bouton « Générer l'ordonnance » → toast.

### 11. Prescrire une consultation spécialiste (`prescrire_specialiste`) — médecin
- Bandeau bordeaux « Cas d'utilisation critique du rapport ».
- Sélecteurs Patient / Consultation actuelle ; grille de **spécialités** (6 boutons sélectionnables,
  actif = bordure bordeaux) ; sélecteur du médecin spécialiste ; motif (textarea) ; bouton bordeaux
  « Générer la prescription de consultation » → navigation + toast.

### 12. Diagrammes UML (`uml`) — explorateur pédagogique
Barre d'onglets : Contexte · Packages · Classes métier · Objets · Cas d'utilisation · Activité ·
État-transition · Séquence.
- **Contexte** : système central (boîte navy) entouré des acteurs Assureur, Médecin, Système bancaire,
  avec lignes de liaison (SVG).
- **Packages** : 3 paquets — `Gestion_Inscription`, `Gestion_Prescription`, `Gestion_Remboursement`
  (en-têtes colorés + contenu).
- **Classes métier** : boîtes de classes **UML formelles** à 3 compartiments (nom / attributs typés /
  opérations), avec héritage : `Personne` (abstraite) ◁ `Assuré`, `Médecin` ◁ `MédecinGénéraliste`,
  `MédecinSpécialiste` ; + `Consultation`, `FeuilleDeMaladie`, `Prescription`, `Médicament`,
  `Remboursement`, `Facture`. Attributs/opérations en mono.
- **Objets** : instance concrète (sandrine:Assuré, atangana:MédecinGén., cons3400:Consultation,
  fm0890:FeuilleMaladie, rb0456:Remboursement) — boîtes objet soulignées.
- **Cas d'utilisation** : **filtré par le compte connecté** (Option 2). Acteur principal (figure
  stick-figure SVG + libellé) relié à une **frontière système** en pointillés contenant ses ovales :
  - Assureur : Inscrire un assuré, Affecter un médecin traitant, Compléter une feuille, Effectuer le
    remboursement, Imprimer une facture (+ acteur secondaire **Système bancaire** relié, côté droit).
  - Médecin : Enregistrer une feuille de maladie, Prescrire des médicaments, Prescrire une consultation
    spécialiste.
  - Encart « Connectez-vous en <autre rôle> pour voir ses cas d'utilisation ». Clic sur un ovale →
    ouvre l'écran correspondant.
- **Activité** : **diagramme en couloirs (swimlanes)** 3 lanes — Médecin (bordeaux) · Assureur (navy) ·
  Système bancaire (bleu). Bandes de fond teintées par lane. Nœud début (médecin), étapes numérotées
  ① → ⑦ placées dans le couloir de leur acteur (grid-row = ordre), décision losange « Patient assuré ? »
  avec branche annexe « non → Rejetée », connecteurs ↓ / ↘ / ↙ entre étapes, nœud fin (assureur).
  Ordre : 1 Consultation → 2 Création feuille → ◆ décision → 3 Complétion → 4 Choix mode → 5 Exécution
  virement (banque) → 6 Mise à jour état → 7 Génération facture → fin.
- **État-transition** : machine à états de la feuille — nœuds cliquables Créée / Complétée / En attente /
  Remboursée / Rejetée. Sélection → carte détail (badge + description + transition entrante/sortante).
- **Séquence** : 6 colonnes (Assureur, UI, Controller, Service, Repository, Banque) + 7 messages
  numérotés (appels et retours) pour « Effectuer un remboursement » par virement.

### 13. Paramètres (`parametres`)
- Carte Profil (Nom affiché éditable, Rôle en lecture seule). Carte Préférences (2 toggles :
  Notifications e-mail = ON, Panneau UML par défaut = OFF — purement visuels).

---

## Panneau « Traçabilité UML » (transverse)
- Bascule via le bouton du header (`umlOpen`), masqué par défaut, largeur 360px, animation `csiPanel`.
- En-tête navy : « Traçabilité UML », titre de l'écran, badge du **type de diagramme** concerné.
- Sections : **Acteur(s)** (chips), **Cas d'utilisation** (encart bordure gauche navy),
  **Préconditions** (liste), **Scénario nominal** (timeline numérotée verticale),
  **Scénarios alternatifs** (encarts rouges), **Classes / entités** (chips mono navy),
  **Changement d'état** (encart vert).
- Le contenu provient d'une **map `traceMap`** indexée par clé d'écran. Naviguer via une étape de
  workflow ou un cas d'utilisation ouvre l'écran ET force `umlOpen=true` avec la bonne clé (`openWith`).

---

## Interactions & Behavior
- Navigation : changement de `screen` (pas de routeur dans le prototype → utiliser le routeur du
  codebase, ex. React Router, avec une route par écran).
- `go(screen, traceKey)` réinitialise les sous-états de formulaire ; `openWith(...)` fait pareil mais
  ouvre aussi le panneau UML.
- Hover : cartes/boutons remontent (`translateY(-1/-2px)`) et/ou prennent une ombre ; liens d'action
  changent de couleur de bordure.
- Toast : apparait en bas-centre (`csiPop`), disparait après ~2.6s.
- Modale : overlay sombre, fermeture au clic sur l'overlay ou bouton Annuler.
- Stepper : transitions d'étape animées `csiFade` ; ronds passent gris → navy (actif) → vert (fait).
- Virement bancaire : machine à 3 états `idle → processing (barre animée ~1.6s) → done`.
- Ordonnance : aperçu lié en temps réel aux lignes de médicaments éditables.
- Validation login : messages d'erreur contextuels (voir écran 0).

## State Management
État applicatif (prototype, à mapper sur le store du codebase) :
- `authed` (bool), `role` (`'assureur' | 'medecin'`), `authView` (`'login' | 'inscription'`),
  `inscrDone`, `loginId`, `loginPw`, `loginError`.
- `screen` (clé d'écran), `umlOpen` (bool), `traceKey` (clé de traçabilité courante), `toast`.
- Formulaires/flux : `insuredStep` (1–4), `rembStep` (1–6), `rembMode` (`'especes'|'virement'`),
  `rembBankState` (`'idle'|'processing'|'done'`), `medRows[]` (lignes ordonnance),
  `referralSpec` (spécialité choisie), `feuilleSubmitted`, `completeFound`, `assureFound`,
  `modal` (`'medConfirm'|null`), `umlTab` (onglet UML), `stateMachineSel` (état sélectionné).

### Modèle de données (UML — pour l'API/back)
Entités : `Personne` (abstraite : nom, prénom, dateNaiss, sexe) ; `Assuré` ◁ Personne (idAssuré,
profession, groupeSanguin, statut) ; `Médecin` ◁ Personne (numOrdre, établissement) ;
`MédecinGénéraliste` ◁ Médecin ; `MédecinSpécialiste` ◁ Médecin (spécialité) ; `Consultation`
(idConsult, date, motif) ; `FeuilleDeMaladie` (code, diagnostic, montantSoins, état) ;
`Prescription` (idPresc, type, date) ; `Médicament` (code, nom, posologie) ; `Remboursement`
(montant, taux, mode) ; `Facture` (numFacture, dateÉmission).

Opérations clés : inscrireAssuré, affecterTraitant, créerFeuille, compléterFeuille,
effectuerRemboursement (avec appel SystèmeBancaire pour virement), imprimerFacture,
prescrireMédicaments, orienterSpécialiste.

États de la `FeuilleDeMaladie` : **Créée → Complétée → (En attente) → Remboursée** ; alternative
**Rejetée**. Modes de paiement : **Espèces**, **Virement bancaire**.

> ⚠️ À confirmer avec le rapport d'origine : noms exacts des états, des packages, et l'acteur
> responsable de la création vs complétion de la feuille (ici : médecin crée, assureur complète).

## Assets
- **Polices** : IBM Plex Sans / Serif / Mono (Google Fonts).
- **Icônes** : SVG inline (icônes de navigation tracées à la main) + quelques **emoji** (🛡️ 🩺 🏦 💵
  💊 ➡️ 📄 💰 🧾 🔔 ◈). Les remplacer par la bibliothèque d'icônes du codebase si souhaité.
- **Logo** : pastille « C » sur dégradé orange (placeholder — remplacer par le vrai logo CNAM/ENSPY
  si disponible).
- Aucune image bitmap externe.

## Files
- `Systeme-CSI.dc.html` — prototype complet (tous les écrans, la logique d'état et la map de
  traçabilité UML). Référence unique pour l'implémentation.
