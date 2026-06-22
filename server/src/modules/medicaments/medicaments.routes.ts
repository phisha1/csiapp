import { Router } from 'express';
import { Role } from '@prisma/client';
import { requireAuth, requireRole } from '../../middlewares/auth';
import { createMedicamentHandler, listMedicamentsHandler } from './medicaments.controller';

const router = Router();
router.use(requireAuth);

// Lecture du catalogue : tout médecin peut le consulter pour prescrire (BF8).
router.get('/', listMedicamentsHandler);
// Ajout au catalogue : réservé à l'assureur.
router.post('/', requireRole(Role.ASSUREUR), createMedicamentHandler);

export default router;
