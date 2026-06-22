import { Router } from 'express';
import { Role } from '@prisma/client';
import { requireAuth, requireRole } from '../../middlewares/auth';
import { listAuditHandler, rapportRemboursementsHandler } from './audit.controller';

const router = Router();
router.use(requireAuth, requireRole(Role.ASSUREUR));

router.get('/', listAuditHandler);
router.get('/remboursements', rapportRemboursementsHandler); // BNF7

export default router;
