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

// Lecture : annuaire professionnel uniquement, sans accès administrateur.
router.get('/', requireRole(Role.ASSUREUR, Role.GENERALISTE, Role.SPECIALISTE), listMedecinsHandler);
router.get('/:id', requireRole(Role.ASSUREUR, Role.GENERALISTE, Role.SPECIALISTE), getMedecinHandler);

// Écriture : réservée à l'assureur (BF2).
router.post('/', requireRole(Role.ASSUREUR), createMedecinHandler);
router.patch('/:id', requireRole(Role.ASSUREUR), updateMedecinHandler);

export default router;
