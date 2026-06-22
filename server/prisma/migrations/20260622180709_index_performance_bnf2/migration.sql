-- CreateIndex
CREATE INDEX "Consultation_assureId_idx" ON "Consultation"("assureId");

-- CreateIndex
CREATE INDEX "Consultation_medecinId_idx" ON "Consultation"("medecinId");

-- CreateIndex
CREATE INDEX "Facture_assureId_idx" ON "Facture"("assureId");

-- CreateIndex
CREATE INDEX "FeuilleMaladie_etat_idx" ON "FeuilleMaladie"("etat");

-- CreateIndex
CREATE INDEX "FeuilleMaladie_assureId_idx" ON "FeuilleMaladie"("assureId");

-- CreateIndex
CREATE INDEX "FeuilleMaladie_medecinId_idx" ON "FeuilleMaladie"("medecinId");

-- CreateIndex
CREATE INDEX "JournalAudit_action_idx" ON "JournalAudit"("action");

-- CreateIndex
CREATE INDEX "JournalAudit_horodatage_idx" ON "JournalAudit"("horodatage");

-- CreateIndex
CREATE INDEX "JournalAudit_utilisateurId_idx" ON "JournalAudit"("utilisateurId");

-- CreateIndex
CREATE INDEX "MedecinTraitantHist_assureId_idx" ON "MedecinTraitantHist"("assureId");

-- CreateIndex
CREATE INDEX "Prescription_feuilleId_idx" ON "Prescription"("feuilleId");

-- CreateIndex
CREATE INDEX "Prescription_medecinId_idx" ON "Prescription"("medecinId");

-- CreateIndex
CREATE INDEX "Prescription_assureId_idx" ON "Prescription"("assureId");

-- CreateIndex
CREATE INDEX "Remboursement_assureId_idx" ON "Remboursement"("assureId");
