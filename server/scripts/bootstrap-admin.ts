import 'dotenv/config';
import { PrismaClient, Role } from '@prisma/client';
import { hashPassword } from '../src/lib/password';

const prisma = new PrismaClient();

function requireStrongInitialPassword(value: string | undefined): string {
  if (!value || value.length < 12 || !/[A-Z]/.test(value) || !/[a-z]/.test(value) || !/[0-9]/.test(value)) {
    throw new Error('ADMIN_INITIAL_PASSWORD doit contenir au moins 12 caractères, une majuscule, une minuscule et un chiffre.');
  }
  return value;
}

async function main() {
  const login = process.env.ADMIN_LOGIN?.trim().toLowerCase();
  if (!login) throw new Error('ADMIN_LOGIN est requis.');
  const password = requireStrongInitialPassword(process.env.ADMIN_INITIAL_PASSWORD);

  const existingAdmin = await prisma.utilisateur.findFirst({ where: { role: Role.ADMIN } });
  if (existingAdmin) {
    throw new Error('Un administrateur existe déjà. Utilisez la procédure de réinitialisation, pas le bootstrap.');
  }

  const validityHours = Number(process.env.TEMP_PASSWORD_EXPIRES_HOURS || 24);
  const expiration = new Date(Date.now() + validityHours * 60 * 60 * 1_000);
  await prisma.utilisateur.create({
    data: {
      login,
      motDePasseHash: await hashPassword(password),
      role: Role.ADMIN,
      doitChangerMotDePasse: true,
      motDePasseTemporaireExpireLe: expiration,
    },
  });

  console.log(`Administrateur ${login} créé. Le mot de passe initial expire le ${expiration.toISOString()}.`);
}

main()
  .catch((error) => {
    console.error(error instanceof Error ? error.message : error);
    process.exitCode = 1;
  })
  .finally(() => prisma.$disconnect());
