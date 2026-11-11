-- Verrou de connexion temporaire : remplace le blocage définitif après N échecs.
ALTER TABLE "Utilisateur" ADD COLUMN "verrouilleJusquA" TIMESTAMP(3);

-- Les comptes bloqués par l'ancien mécanisme (échecs de connexion) sont rendus :
-- ce statut n'est plus posé automatiquement. Les comptes SUSPENDU ne sont pas touchés.
UPDATE "Utilisateur" SET "statut" = 'ACTIF', "nbEchecs" = 0 WHERE "statut" = 'BLOQUE';

-- Séparation des tâches : on retient qui a validé la feuille.
ALTER TABLE "FeuilleMaladie" ADD COLUMN "valideParId" TEXT;
ALTER TABLE "FeuilleMaladie"
  ADD CONSTRAINT "FeuilleMaladie_valideParId_fkey"
  FOREIGN KEY ("valideParId") REFERENCES "Utilisateur"("id")
  ON DELETE SET NULL ON UPDATE CASCADE;

-- Références de remboursement et de facture : une séquence ne donne jamais deux
-- fois le même numéro, contrairement à COUNT(*) + 1 sous accès concurrents.
CREATE SEQUENCE remboursement_reference_seq;
SELECT setval('remboursement_reference_seq', (SELECT COUNT(*) FROM "Remboursement") + 1, false);
CREATE SEQUENCE facture_reference_seq;
SELECT setval('facture_reference_seq', (SELECT COUNT(*) FROM "Facture") + 1, false);
