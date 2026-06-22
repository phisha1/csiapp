import { Router } from 'express';
import { Role } from '@prisma/client';
import { requireAuth, requireRole } from '../../middlewares/auth';
import {
  createMedecinHandler,
  getMedecinHandler,
  listMedecinsHandler,
  updateMedecinHandler,
} from './medecins.controller';

const router = Router();
router.use(requireAuth);

// Lecture : tout utilisateur authentifié (un médecin peut consulter l'annuaire).
router.get('/', listMedecinsHandler);
router.get('/:id', getMedecinHandler);

// Écriture : réservée à l'assureur (BF2).
router.post('/', requireRole(Role.ASSUREUR), createMedecinHandler);
router.patch('/:id', requireRole(Role.ASSUREUR), updateMedecinHandler);

export default router;
