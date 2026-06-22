import { Router } from 'express';
import { Role } from '@prisma/client';
import { requireAuth, requireRole } from '../../middlewares/auth';
import {
  getPrescriptionHandler,
  listPrescriptionsHandler,
  orienterHandler,
  prescrireMedicamentsHandler,
} from './prescriptions.controller';

const router = Router();
router.use(requireAuth);

router.get('/', listPrescriptionsHandler);
router.get('/:id', getPrescriptionHandler);

// Prescriptions : réservées aux médecins (BF8, BF9).
router.post('/medicaments', requireRole(Role.GENERALISTE, Role.SPECIALISTE), prescrireMedicamentsHandler);
router.post('/orientation', requireRole(Role.GENERALISTE, Role.SPECIALISTE), orienterHandler);

export default router;
