import { Router } from 'express';
import { requireAuth, requireRole } from '../../middlewares/auth';
import { Role } from '@prisma/client';
import { getStatsHandler } from './stats.controller';

const router = Router();
router.use(requireAuth, requireRole(Role.ASSUREUR, Role.GENERALISTE, Role.SPECIALISTE));
router.get('/', getStatsHandler); // statistiques du tableau de bord (selon le rôle)

export default router;
