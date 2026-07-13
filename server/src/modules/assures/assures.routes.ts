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

// Lecture : assureur ou médecin ayant une relation de soins avec le patient.
router.get('/', requireRole(Role.ASSUREUR, Role.GENERALISTE, Role.SPECIALISTE), listAssuresHandler);
router.get('/:id', requireRole(Role.ASSUREUR, Role.GENERALISTE, Role.SPECIALISTE), getAssureHandler);

// Écriture : réservée à l'assureur (BF3, BF4).
router.post('/', requireRole(Role.ASSUREUR), createAssureHandler);
router.patch('/:id', requireRole(Role.ASSUREUR), updateAssureHandler);
router.put('/:id/traitant', requireRole(Role.ASSUREUR), setTraitantHandler);

export default router;
