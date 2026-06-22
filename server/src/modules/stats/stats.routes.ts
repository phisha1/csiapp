import { Router } from 'express';
import { requireAuth } from '../../middlewares/auth';
import { getStatsHandler } from './stats.controller';

const router = Router();
router.use(requireAuth);
router.get('/', getStatsHandler); // statistiques du tableau de bord (selon le rôle)

export default router;
