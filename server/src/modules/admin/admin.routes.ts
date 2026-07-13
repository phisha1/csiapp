import { Router } from 'express';
import { Role } from '@prisma/client';
import { requireAuth, requireRole } from '../../middlewares/auth';
import { listHandler, reactiverHandler, suspendreHandler } from './admin.controller';

const router = Router();

// Toutes les routes d'administration exigent un compte ADMIN authentifié.
router.use(requireAuth, requireRole(Role.ADMIN));

router.get('/utilisateurs', listHandler);
router.post('/utilisateurs/:id/reactiver', reactiverHandler);
router.post('/utilisateurs/:id/suspendre', suspendreHandler);

export default router;
