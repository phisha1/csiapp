-- Les anciens chemins pointaient vers le disque éphémère du serveur et ne
-- constituaient pas une archive durable. Les PDF seront régénérés à la demande.
ALTER TABLE "Facture" DROP COLUMN "cheminPdf";

CREATE TABLE "FactureDocument" (
    "factureId" TEXT NOT NULL,
    "contenuChiffre" BYTEA NOT NULL,
    "sha256" TEXT NOT NULL,
    "genereLe" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "FactureDocument_pkey" PRIMARY KEY ("factureId")
);

ALTER TABLE "FactureDocument"
ADD CONSTRAINT "FactureDocument_factureId_fkey"
FOREIGN KEY ("factureId") REFERENCES "Facture"("id")
ON DELETE CASCADE ON UPDATE CASCADE;
