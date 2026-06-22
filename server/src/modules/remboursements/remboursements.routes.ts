import { Router } from 'express';
import { Role } from '@prisma/client';
import { requireAuth, requireRole } from '../../middlewares/auth';
import {
  effectuerRemboursementHandler,
  getRemboursementHandler,
  listRemboursementsHandler,
} from './remboursements.controller';

const router = Router();
router.use(requireAuth);

// Remboursements : réservés à l'assureur (BF5).
router.get('/', requireRole(Role.ASSUREUR), listRemboursementsHandler);
router.get('/:id', requireRole(Role.ASSUREUR), getRemboursementHandler);
router.post('/', requireRole(Role.ASSUREUR), effectuerRemboursementHandler);

export default router;
