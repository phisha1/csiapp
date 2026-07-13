import { Router } from 'express';
import { Role } from '@prisma/client';
import { requireAuth, requireRole } from '../../middlewares/auth';
import { getFactureHandler, getFacturePdfHandler, listFacturesHandler } from './factures.controller';

const router = Router();
router.use(requireAuth, requireRole(Role.ASSUREUR));

router.get('/', listFacturesHandler);
router.get('/:id', getFactureHandler);
router.get('/:id/pdf', getFacturePdfHandler); // BF12 : impression

export default router;
