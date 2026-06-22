import { Router } from 'express';
import { Role } from '@prisma/client';
import { requireAuth, requireRole } from '../../middlewares/auth';
import {
  completerHandler,
  createFeuilleHandler,
  getFeuilleHandler,
  incompleteHandler,
  listFeuillesHandler,
  ouvrirHandler,
  refuserHandler,
} from './feuilles.controller';

const router = Router();
router.use(requireAuth);

router.get('/', listFeuillesHandler);
router.get('/:id', getFeuilleHandler);

// Création par un médecin (BF7).
router.post('/', requireRole(Role.GENERALISTE, Role.SPECIALISTE), createFeuilleHandler);

// Traitement par l'assureur (BF6 + transitions du cycle de vie).
router.patch('/:id/ouvrir', requireRole(Role.ASSUREUR), ouvrirHandler);
router.patch('/:id/completer', requireRole(Role.ASSUREUR), completerHandler);
router.patch('/:id/incomplete', requireRole(Role.ASSUREUR), incompleteHandler);
router.patch('/:id/refuser', requireRole(Role.ASSUREUR), refuserHandler);

export default router;
