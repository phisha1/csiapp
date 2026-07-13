import 'dotenv/config';
import { PrismaClient, Role, Sexe, TypeMedecin } from '@prisma/client';
import bcrypt from 'bcryptjs';
import { randomBytes } from 'crypto';

const prisma = new PrismaClient();
const hash = (password: string) => bcrypt.hash(password, 10);
const allowDemoAccounts = process.env.ALLOW_DEMO_SEED === 'true';

function temporaryPassword() {
  return `Tmp${randomBytes(6).toString('hex')}42`;
}

function expiresAt() {
  const hours = Number(process.env.TEMP_PASSWORD_EXPIRES_HOURS || 24);
  return new Date(Date.now() + hours * 60 * 60 * 1_000);
}

async function seedReferenceData() {
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

  for (const medicine of [
    { code: 'MED-0421', nom: 'Amoxicilline 500mg', forme: 'Comprimé' },
    { code: 'MED-0107', nom: 'Paracétamol 1000mg', forme: 'Comprimé' },
    { code: 'MED-0233', nom: 'Artéméther/Luméfantrine', forme: 'Comprimé' },
    { code: 'MED-0501', nom: 'Ibuprofène 400mg', forme: 'Comprimé' },
  ]) {
    await prisma.medicamentCatalogue.upsert({
      where: { code: medicine.code },
      update: medicine,
      create: medicine,
    });
  }

  return cardiologie;
}

async function seedDemoAccounts(cardiologieId: string) {
  if (process.env.NODE_ENV === 'production') {
    throw new Error('Le seed des comptes de démonstration est interdit en production.');
  }

  const credentials: Array<{ login: string; password: string }> = [];
  const upsertAccount = async (login: string, role: Role) => {
    const password = temporaryPassword();
    await prisma.utilisateur.upsert({
      where: { login },
      update: {
        motDePasseHash: await hash(password),
        role,
        doitChangerMotDePasse: true,
        motDePasseTemporaireExpireLe: expiresAt(),
        nbEchecs: 0,
        versionSession: { increment: 1 },
      },
      create: {
        login,
        motDePasseHash: await hash(password),
        role,
        doitChangerMotDePasse: true,
        motDePasseTemporaireExpireLe: expiresAt(),
      },
    });
    credentials.push({ login, password });
  };

  await upsertAccount('admin', Role.ADMIN);
  await upsertAccount('assureur', Role.ASSUREUR);

  const doctors = [
    {
      login: 'medecin',
      role: Role.GENERALISTE,
      numOrdre: 'CM-MED-001',
      nom: 'Atangana',
      prenom: 'Paul',
      sexe: Sexe.M,
      dateNaissance: new Date('1980-05-12'),
      type: TypeMedecin.GENERALISTE,
      etablissement: 'Hôpital Central de Yaoundé',
      specialiteId: null,
    },
    {
      login: 'specialiste',
      role: Role.SPECIALISTE,
      numOrdre: 'CM-MED-002',
      nom: 'Fouda',
      prenom: 'Claire',
      sexe: Sexe.F,
      dateNaissance: new Date('1975-09-30'),
      type: TypeMedecin.SPECIALISTE,
      etablissement: 'Clinique du Cœur',
      specialiteId: cardiologieId,
    },
  ];

  for (const doctor of doctors) {
    const existing = await prisma.medecin.findUnique({
      where: { numOrdre: doctor.numOrdre },
      include: { utilisateur: true },
    });
    if (existing?.utilisateurId && existing.utilisateur) {
      const password = temporaryPassword();
      await prisma.utilisateur.update({
        where: { id: existing.utilisateurId },
        data: {
          motDePasseHash: await hash(password),
          role: doctor.role,
          doitChangerMotDePasse: true,
          motDePasseTemporaireExpireLe: expiresAt(),
          nbEchecs: 0,
          versionSession: { increment: 1 },
        },
      });
      credentials.push({ login: existing.utilisateur.login, password });
      continue;
    }

    const password = temporaryPassword();
    const utilisateur = await prisma.utilisateur.create({
      data: {
        login: doctor.login,
        motDePasseHash: await hash(password),
        role: doctor.role,
        doitChangerMotDePasse: true,
        motDePasseTemporaireExpireLe: expiresAt(),
      },
    });

    if (existing) {
      await prisma.medecin.update({
        where: { id: existing.id },
        data: { utilisateurId: utilisateur.id },
      });
      credentials.push({ login: doctor.login, password });
      continue;
    }

    await prisma.medecin.create({
      data: {
        personne: {
          create: {
            nom: doctor.nom,
            prenom: doctor.prenom,
            sexe: doctor.sexe,
            dateNaissance: doctor.dateNaissance,
          },
        },
        numOrdre: doctor.numOrdre,
        type: doctor.type,
        etablissement: doctor.etablissement,
        specialite: doctor.specialiteId ? { connect: { id: doctor.specialiteId } } : undefined,
        utilisateur: { connect: { id: utilisateur.id } },
      },
    });
    credentials.push({ login: doctor.login, password });
  }

  console.log('Comptes de démonstration créés. Mots de passe temporaires à transmettre une seule fois :');
  for (const credential of credentials) {
    console.log(`- ${credential.login}: ${credential.password}`);
  }
}

async function main() {
  const cardiologie = await seedReferenceData();
  if (allowDemoAccounts) {
    await seedDemoAccounts(cardiologie.id);
  } else {
    console.log('Données de référence créées. Aucun compte utilisateur ajouté.');
  }
}

main()
  .catch((error) => {
    console.error(error);
    process.exitCode = 1;
  })
  .finally(() => prisma.$disconnect());
