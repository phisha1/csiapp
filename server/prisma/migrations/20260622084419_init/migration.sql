-- CreateEnum
CREATE TYPE "Role" AS ENUM ('ASSUREUR', 'GENERALISTE', 'SPECIALISTE');

-- CreateEnum
CREATE TYPE "StatutCompte" AS ENUM ('ACTIF', 'BLOQUE');

-- CreateEnum
CREATE TYPE "Sexe" AS ENUM ('M', 'F');

-- CreateEnum
CREATE TYPE "TypeMedecin" AS ENUM ('GENERALISTE', 'SPECIALISTE');

-- CreateEnum
CREATE TYPE "ModeRemboursement" AS ENUM ('ESPECES', 'VIREMENT');

-- CreateEnum
CREATE TYPE "EtatFeuille" AS ENUM ('BROUILLON', 'TRANSMISE', 'EN_COURS', 'INCOMPLETE', 'VALIDEE', 'REMBOURSEE', 'REFUSEE', 'SUPPRIMEE');

-- CreateEnum
CREATE TYPE "TypePrescription" AS ENUM ('MEDICAMENT', 'ORIENTATION');

-- CreateEnum
CREATE TYPE "StatutRemboursement" AS ENUM ('EN_ATTENTE', 'EN_COURS', 'EFFECTUE', 'ECHOUE');

-- CreateEnum
CREATE TYPE "NiveauUrgence" AS ENUM ('NORMAL', 'URGENT', 'TRES_URGENT');

-- CreateTable
CREATE TABLE "Utilisateur" (
    "id" TEXT NOT NULL,
    "login" TEXT NOT NULL,
    "motDePasseHash" TEXT NOT NULL,
    "role" "Role" NOT NULL,
    "statut" "StatutCompte" NOT NULL DEFAULT 'ACTIF',
    "nbEchecs" INTEGER NOT NULL DEFAULT 0,
    "derniereConnexion" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Utilisateur_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Personne" (
    "id" TEXT NOT NULL,
    "nom" TEXT NOT NULL,
    "prenom" TEXT NOT NULL,
    "sexe" "Sexe" NOT NULL,
    "dateNaissance" TIMESTAMP(3) NOT NULL,
    "telephone" TEXT,
    "email" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Personne_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Assure" (
    "id" TEXT NOT NULL,
    "personneId" TEXT NOT NULL,
    "matricule" TEXT NOT NULL,
    "numeroSecu" TEXT,
    "profession" TEXT,
    "employeur" TEXT,
    "groupe" TEXT,
    "statut" TEXT NOT NULL DEFAULT 'Actif',
    "modeRembPref" "ModeRemboursement" NOT NULL DEFAULT 'ESPECES',
    "traitantId" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Assure_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Medecin" (
    "id" TEXT NOT NULL,
    "personneId" TEXT NOT NULL,
    "numOrdre" TEXT NOT NULL,
    "type" "TypeMedecin" NOT NULL,
    "specialiteId" TEXT,
    "etablissement" TEXT,
    "utilisateurId" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Medecin_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Specialite" (
    "id" TEXT NOT NULL,
    "libelle" TEXT NOT NULL,

    CONSTRAINT "Specialite_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "MedecinTraitantHist" (
    "id" TEXT NOT NULL,
    "assureId" TEXT NOT NULL,
    "medecinId" TEXT NOT NULL,
    "dateDebut" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "dateFin" TIMESTAMP(3),

    CONSTRAINT "MedecinTraitantHist_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "CoordBancaire" (
    "id" TEXT NOT NULL,
    "assureId" TEXT NOT NULL,
    "banque" TEXT NOT NULL,
    "numeroCompte" TEXT NOT NULL,
    "titulaire" TEXT NOT NULL,

    CONSTRAINT "CoordBancaire_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Consultation" (
    "id" TEXT NOT NULL,
    "assureId" TEXT NOT NULL,
    "medecinId" TEXT NOT NULL,
    "date" TIMESTAMP(3) NOT NULL,
    "motif" TEXT,
    "type" "TypeMedecin" NOT NULL,
    "diagnostic" TEXT,
    "actes" TEXT,
    "suite" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Consultation_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "FeuilleMaladie" (
    "id" TEXT NOT NULL,
    "code" TEXT NOT NULL,
    "assureId" TEXT NOT NULL,
    "medecinId" TEXT NOT NULL,
    "consultationId" TEXT,
    "date" TIMESTAMP(3) NOT NULL,
    "diagnostic" TEXT,
    "montant" DECIMAL(12,2) NOT NULL,
    "etat" "EtatFeuille" NOT NULL DEFAULT 'BROUILLON',
    "taux" INTEGER,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "FeuilleMaladie_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Prescription" (
    "id" TEXT NOT NULL,
    "feuilleId" TEXT NOT NULL,
    "assureId" TEXT NOT NULL,
    "medecinId" TEXT NOT NULL,
    "date" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "type" "TypePrescription" NOT NULL,
    "specialiteId" TEXT,
    "medecinSpecialisteId" TEXT,
    "niveauUrgence" "NiveauUrgence",
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Prescription_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "MedicamentCatalogue" (
    "id" TEXT NOT NULL,
    "code" TEXT NOT NULL,
    "nom" TEXT NOT NULL,
    "forme" TEXT,

    CONSTRAINT "MedicamentCatalogue_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "OrdonnanceLigne" (
    "id" TEXT NOT NULL,
    "prescriptionId" TEXT NOT NULL,
    "medicamentId" TEXT NOT NULL,
    "posologie" TEXT,
    "duree" TEXT,
    "instructions" TEXT,

    CONSTRAINT "OrdonnanceLigne_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Remboursement" (
    "id" TEXT NOT NULL,
    "reference" TEXT NOT NULL,
    "feuilleId" TEXT NOT NULL,
    "assureId" TEXT NOT NULL,
    "montant" DECIMAL(12,2) NOT NULL,
    "taux" INTEGER NOT NULL,
    "mode" "ModeRemboursement" NOT NULL,
    "statut" "StatutRemboursement" NOT NULL DEFAULT 'EN_ATTENTE',
    "referenceBancaire" TEXT,
    "date" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Remboursement_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Facture" (
    "id" TEXT NOT NULL,
    "reference" TEXT NOT NULL,
    "remboursementId" TEXT,
    "assureId" TEXT NOT NULL,
    "feuilleId" TEXT NOT NULL,
    "montant" DECIMAL(12,2) NOT NULL,
    "date" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "statut" TEXT NOT NULL DEFAULT 'Émise',
    "cheminPdf" TEXT,

    CONSTRAINT "Facture_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "JournalAudit" (
    "id" TEXT NOT NULL,
    "utilisateurId" TEXT,
    "action" TEXT NOT NULL,
    "entite" TEXT,
    "entiteId" TEXT,
    "details" JSONB,
    "horodatage" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "JournalAudit_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "Utilisateur_login_key" ON "Utilisateur"("login");

-- CreateIndex
CREATE UNIQUE INDEX "Assure_personneId_key" ON "Assure"("personneId");

-- CreateIndex
CREATE UNIQUE INDEX "Assure_matricule_key" ON "Assure"("matricule");

-- CreateIndex
CREATE UNIQUE INDEX "Assure_numeroSecu_key" ON "Assure"("numeroSecu");

-- CreateIndex
CREATE UNIQUE INDEX "Medecin_personneId_key" ON "Medecin"("personneId");

-- CreateIndex
CREATE UNIQUE INDEX "Medecin_numOrdre_key" ON "Medecin"("numOrdre");

-- CreateIndex
CREATE UNIQUE INDEX "Medecin_utilisateurId_key" ON "Medecin"("utilisateurId");

-- CreateIndex
CREATE UNIQUE INDEX "Specialite_libelle_key" ON "Specialite"("libelle");

-- CreateIndex
CREATE UNIQUE INDEX "CoordBancaire_assureId_key" ON "CoordBancaire"("assureId");

-- CreateIndex
CREATE UNIQUE INDEX "FeuilleMaladie_code_key" ON "FeuilleMaladie"("code");

-- CreateIndex
CREATE UNIQUE INDEX "FeuilleMaladie_consultationId_key" ON "FeuilleMaladie"("consultationId");

-- CreateIndex
CREATE UNIQUE INDEX "MedicamentCatalogue_code_key" ON "MedicamentCatalogue"("code");

-- CreateIndex
CREATE UNIQUE INDEX "Remboursement_reference_key" ON "Remboursement"("reference");

-- CreateIndex
CREATE UNIQUE INDEX "Remboursement_feuilleId_key" ON "Remboursement"("feuilleId");

-- CreateIndex
CREATE UNIQUE INDEX "Facture_reference_key" ON "Facture"("reference");

-- CreateIndex
CREATE UNIQUE INDEX "Facture_remboursementId_key" ON "Facture"("remboursementId");

-- CreateIndex
CREATE UNIQUE INDEX "Facture_feuilleId_key" ON "Facture"("feuilleId");

-- AddForeignKey
ALTER TABLE "Assure" ADD CONSTRAINT "Assure_personneId_fkey" FOREIGN KEY ("personneId") REFERENCES "Personne"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Assure" ADD CONSTRAINT "Assure_traitantId_fkey" FOREIGN KEY ("traitantId") REFERENCES "Medecin"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Medecin" ADD CONSTRAINT "Medecin_personneId_fkey" FOREIGN KEY ("personneId") REFERENCES "Personne"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Medecin" ADD CONSTRAINT "Medecin_specialiteId_fkey" FOREIGN KEY ("specialiteId") REFERENCES "Specialite"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Medecin" ADD CONSTRAINT "Medecin_utilisateurId_fkey" FOREIGN KEY ("utilisateurId") REFERENCES "Utilisateur"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "MedecinTraitantHist" ADD CONSTRAINT "MedecinTraitantHist_assureId_fkey" FOREIGN KEY ("assureId") REFERENCES "Assure"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "MedecinTraitantHist" ADD CONSTRAINT "MedecinTraitantHist_medecinId_fkey" FOREIGN KEY ("medecinId") REFERENCES "Medecin"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "CoordBancaire" ADD CONSTRAINT "CoordBancaire_assureId_fkey" FOREIGN KEY ("assureId") REFERENCES "Assure"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Consultation" ADD CONSTRAINT "Consultation_assureId_fkey" FOREIGN KEY ("assureId") REFERENCES "Assure"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Consultation" ADD CONSTRAINT "Consultation_medecinId_fkey" FOREIGN KEY ("medecinId") REFERENCES "Medecin"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "FeuilleMaladie" ADD CONSTRAINT "FeuilleMaladie_assureId_fkey" FOREIGN KEY ("assureId") REFERENCES "Assure"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "FeuilleMaladie" ADD CONSTRAINT "FeuilleMaladie_medecinId_fkey" FOREIGN KEY ("medecinId") REFERENCES "Medecin"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "FeuilleMaladie" ADD CONSTRAINT "FeuilleMaladie_consultationId_fkey" FOREIGN KEY ("consultationId") REFERENCES "Consultation"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Prescription" ADD CONSTRAINT "Prescription_feuilleId_fkey" FOREIGN KEY ("feuilleId") REFERENCES "FeuilleMaladie"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Prescription" ADD CONSTRAINT "Prescription_assureId_fkey" FOREIGN KEY ("assureId") REFERENCES "Assure"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Prescription" ADD CONSTRAINT "Prescription_medecinId_fkey" FOREIGN KEY ("medecinId") REFERENCES "Medecin"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Prescription" ADD CONSTRAINT "Prescription_specialiteId_fkey" FOREIGN KEY ("specialiteId") REFERENCES "Specialite"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Prescription" ADD CONSTRAINT "Prescription_medecinSpecialisteId_fkey" FOREIGN KEY ("medecinSpecialisteId") REFERENCES "Medecin"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "OrdonnanceLigne" ADD CONSTRAINT "OrdonnanceLigne_prescriptionId_fkey" FOREIGN KEY ("prescriptionId") REFERENCES "Prescription"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "OrdonnanceLigne" ADD CONSTRAINT "OrdonnanceLigne_medicamentId_fkey" FOREIGN KEY ("medicamentId") REFERENCES "MedicamentCatalogue"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Remboursement" ADD CONSTRAINT "Remboursement_feuilleId_fkey" FOREIGN KEY ("feuilleId") REFERENCES "FeuilleMaladie"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Remboursement" ADD CONSTRAINT "Remboursement_assureId_fkey" FOREIGN KEY ("assureId") REFERENCES "Assure"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Facture" ADD CONSTRAINT "Facture_remboursementId_fkey" FOREIGN KEY ("remboursementId") REFERENCES "Remboursement"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Facture" ADD CONSTRAINT "Facture_assureId_fkey" FOREIGN KEY ("assureId") REFERENCES "Assure"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Facture" ADD CONSTRAINT "Facture_feuilleId_fkey" FOREIGN KEY ("feuilleId") REFERENCES "FeuilleMaladie"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "JournalAudit" ADD CONSTRAINT "JournalAudit_utilisateurId_fkey" FOREIGN KEY ("utilisateurId") REFERENCES "Utilisateur"("id") ON DELETE SET NULL ON UPDATE CASCADE;
