import { EtatFeuille, Role, Sexe, TypeMedecin } from '@prisma/client';
import { prisma } from '../src/config/prisma';
import { encryptPHI } from '../src/lib/phi';
import { hashPassword } from '../src/lib/password';
import { BUSINESS_E2E } from './e2e-business-data';

function assertSafeDatabase() {
  if (process.env.NODE_ENV === 'production') {
    throw new Error('Les fixtures E2E sont interdites sur une base de production.');
  }
  const databaseUrl = process.env.DATABASE_URL;
  if (!databaseUrl) throw new Error('DATABASE_URL est requis pour les fixtures E2E.');
  const hostname = new URL(databaseUrl).hostname;
  const isLocal = hostname === 'localhost' || hostname === '127.0.0.1';
  if (!isLocal && !process.env.CI) {
    throw new Error(`Base E2E refusée hors environnement local : ${hostname}.`);
  }
}

export async function cleanupE2EFixtures() {
  assertSafeDatabase();
  const [assureur, assure, medecin, feuille] = await Promise.all([
    prisma.utilisateur.findUnique({ where: { login: BUSINESS_E2E.assureurLogin }, select: { id: true } }),
    prisma.assure.findUnique({ where: { matricule: BUSINESS_E2E.assureMatricule }, select: { id: true, personneId: true } }),
    prisma.medecin.findUnique({ where: { numOrdre: BUSINESS_E2E.medecinNumOrdre }, select: { id: true, personneId: true } }),
    prisma.feuilleMaladie.findUnique({ where: { code: BUSINESS_E2E.feuilleCode }, select: { id: true, consultationId: true } }),
  ]);

  if (assureur) {
    await prisma.journalAudit.deleteMany({ where: { utilisateurId: assureur.id } });
  }
  if (feuille) {
    await prisma.facture.deleteMany({ where: { feuilleId: feuille.id } });
    await prisma.remboursement.deleteMany({ where: { feuilleId: feuille.id } });
    await prisma.prescription.deleteMany({ where: { feuilleId: feuille.id } });
    await prisma.feuilleMaladie.delete({ where: { id: feuille.id } });
    if (feuille.consultationId) {
      await prisma.consultation.deleteMany({ where: { id: feuille.consultationId } });
    }
  }
  if (assure) {
    await prisma.medecinTraitantHist.deleteMany({ where: { assureId: assure.id } });
    await prisma.coordBancaire.deleteMany({ where: { assureId: assure.id } });
    await prisma.assure.delete({ where: { id: assure.id } });
    await prisma.personne.delete({ where: { id: assure.personneId } });
  }
  if (medecin) {
    await prisma.medecin.delete({ where: { id: medecin.id } });
    await prisma.personne.delete({ where: { id: medecin.personneId } });
  }
  if (assureur) {
    await prisma.utilisateur.delete({ where: { id: assureur.id } });
  }
}

export async function setupE2EFixtures() {
  assertSafeDatabase();
  await cleanupE2EFixtures();
  const motDePasseHash = await hashPassword(BUSINESS_E2E.assureurPassword);

  await prisma.$transaction(async (tx) => {
    await tx.utilisateur.create({
      data: {
        login: BUSINESS_E2E.assureurLogin,
        motDePasseHash,
        role: Role.ASSUREUR,
        doitChangerMotDePasse: false,
      },
    });
    const medecinPersonne = await tx.personne.create({
      data: {
        nom: BUSINESS_E2E.medecinNom,
        prenom: BUSINESS_E2E.medecinPrenom,
        sexe: Sexe.F,
        email: 'e2e.medecin@example.test',
      },
    });
    const medecin = await tx.medecin.create({
      data: {
        personneId: medecinPersonne.id,
        numOrdre: BUSINESS_E2E.medecinNumOrdre,
        type: TypeMedecin.GENERALISTE,
        etablissement: 'Centre E2E',
      },
    });
    const assurePersonne = await tx.personne.create({
      data: {
        nom: BUSINESS_E2E.assureNom,
        prenom: BUSINESS_E2E.assurePrenom,
        sexe: Sexe.M,
        dateNaissance: new Date('1990-01-15T00:00:00.000Z'),
      },
    });
    const assure = await tx.assure.create({
      data: {
        personneId: assurePersonne.id,
        matricule: BUSINESS_E2E.assureMatricule,
        numeroSecu: BUSINESS_E2E.assureNumeroSecu,
        profession: 'Testeur qualité',
        employeur: 'CNAM E2E',
        groupe: 'O+',
        traitantId: medecin.id,
      },
    });
    const consultation = await tx.consultation.create({
      data: {
        assureId: assure.id,
        medecinId: medecin.id,
        date: new Date('2026-07-12T09:00:00.000Z'),
        motif: encryptPHI('Contrôle E2E'),
        diagnostic: encryptPHI('Diagnostic de validation E2E'),
        actes: encryptPHI('Consultation générale'),
        type: TypeMedecin.GENERALISTE,
      },
    });
    await tx.feuilleMaladie.create({
      data: {
        code: BUSINESS_E2E.feuilleCode,
        assureId: assure.id,
        medecinId: medecin.id,
        consultationId: consultation.id,
        date: new Date('2026-07-12T09:00:00.000Z'),
        diagnostic: encryptPHI('Diagnostic de validation E2E'),
        montant: BUSINESS_E2E.montantSoins,
        etat: EtatFeuille.VALIDEE,
        taux: BUSINESS_E2E.taux,
      },
    });
  });
}

export async function closeE2EFixtureDatabase() {
  await prisma.$disconnect();
}
