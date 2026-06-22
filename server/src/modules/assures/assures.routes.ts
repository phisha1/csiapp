import { Router } from 'express';
import { Role } from '@prisma/client';
import { requireAuth, requireRole } from '../../middlewares/auth';
import {
  createAssureHandler,
  getAssureHandler,
  listAssuresHandler,
  setTraitantHandler,
  updateAssureHandler,
} from './assures.controller';

const router = Router();
router.use(requireAuth);

// Lecture : tout utilisateur authentifié (un médecin sélectionne un patient — BF7).
router.get('/', listAssuresHandler);
router.get('/:id', getAssureHandler);

// Écriture : réservée à l'assureur (BF3, BF4).
router.post('/', requireRole(Role.ASSUREUR), createAssureHandler);
router.patch('/:id', requireRole(Role.ASSUREUR), updateAssureHandler);
router.put('/:id/traitant', requireRole(Role.ASSUREUR), setTraitantHandler);

export default router;
