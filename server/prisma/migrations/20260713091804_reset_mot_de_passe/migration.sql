-- AlterTable
ALTER TABLE "Utilisateur" ADD COLUMN     "doitChangerMotDePasse" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN     "jetonsInvalidesAvant" TIMESTAMP(3);
