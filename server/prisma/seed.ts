import { PrismaClient, Role, Sexe, TypeMedecin } from '@prisma/client';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();
const hash = (p: string) => bcrypt.hash(p, 10);

async function main() {
  // Spécialités de référence
  const cardiologie = await prisma.specialite.upsert({
    where: { libelle: 'Cardiologie' },
    update: {},
    create: { libelle: 'Cardiologie' },
  });
  await prisma.specialite.upsert({
    where: { libelle: 'Pédiatrie' },
    update: {},
    create: { libelle: 'Pédiatrie' },
  });

  // Compte assureur (agent CNAM)
  await prisma.utilisateur.upsert({
    where: { login: 'assureur' },
    update: {},
    create: { login: 'assureur', motDePasseHash: await hash('cnam2024'), role: Role.ASSUREUR },
  });

  // Médecin généraliste : Personne + Medecin + Utilisateur
  if (!(await prisma.medecin.findUnique({ where: { numOrdre: 'CM-MED-001' } }))) {
    const user = await prisma.utilisateur.create({
      data: { login: 'medecin', motDePasseHash: await hash('cnam2024'), role: Role.GENERALISTE },
    });
    const personne = await prisma.personne.create({
      data: { nom: 'Atangana', prenom: 'Paul', sexe: Sexe.M, dateNaissance: new Date('1980-05-12') },
    });
    await prisma.medecin.create({
      data: {
        personneId: personne.id,
        numOrdre: 'CM-MED-001',
        type: TypeMedecin.GENERALISTE,
        etablissement: 'Hôpital Central de Yaoundé',
        utilisateurId: user.id,
      },
    });
  }

  // Médecin spécialiste : Personne + Medecin + Utilisateur
  if (!(await prisma.medecin.findUnique({ where: { numOrdre: 'CM-MED-002' } }))) {
    const user = await prisma.utilisateur.create({
      data: { login: 'specialiste', motDePasseHash: await hash('cnam2024'), role: Role.SPECIALISTE },
    });
    const personne = await prisma.personne.create({
      data: { nom: 'Fouda', prenom: 'Claire', sexe: Sexe.F, dateNaissance: new Date('1975-09-30') },
    });
    await prisma.medecin.create({
      data: {
        personneId: personne.id,
        numOrdre: 'CM-MED-002',
        type: TypeMedecin.SPECIALISTE,
        specialiteId: cardiologie.id,
        etablissement: 'Clinique du Cœur',
        utilisateurId: user.id,
      },
    });
  }

  // Catalogue de médicaments (BF8)
  for (const m of [
    { code: 'MED-0421', nom: 'Amoxicilline 500mg', forme: 'Comprimé' },
    { code: 'MED-0107', nom: 'Paracétamol 1000mg', forme: 'Comprimé' },
    { code: 'MED-0233', nom: 'Artéméther/Luméfantrine', forme: 'Comprimé' },
    { code: 'MED-0501', nom: 'Ibuprofène 400mg', forme: 'Comprimé' },
  ]) {
    await prisma.medicamentCatalogue.upsert({ where: { code: m.code }, update: {}, create: m });
  }

  console.log('✅ Seed terminé — comptes : assureur / medecin / specialiste (mot de passe : cnam2024).');
}

main()
  .catch((e) => {
    console.error(e);
    process.exitCode = 1;
  })
  .finally(() => prisma.$disconnect());
