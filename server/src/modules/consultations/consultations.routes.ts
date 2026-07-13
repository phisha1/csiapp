import { Router } from 'express';
import { Role } from '@prisma/client';
import { requireAuth, requireRole } from '../../middlewares/auth';
import { listConsultationsHandler } from './consultations.controller';

const router = Router();
router.use(requireAuth, requireRole(Role.ASSUREUR, Role.GENERALISTE, Role.SPECIALISTE));
router.get('/', listConsultationsHandler); // médecin : périmètre de soins autorisé ; assureur : toutes

export default router;
