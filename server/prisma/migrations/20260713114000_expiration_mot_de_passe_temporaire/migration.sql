-- AlterTable
ALTER TABLE "Utilisateur"
ADD COLUMN "motDePasseTemporaireExpireLe" TIMESTAMP(3);

-- Les éventuels mots de passe temporaires déjà émis restent valides 24 heures
-- après le déploiement de cette migration.
UPDATE "Utilisateur"
SET "motDePasseTemporaireExpireLe" = CURRENT_TIMESTAMP + INTERVAL '24 hours'
WHERE "doitChangerMotDePasse" = true;
