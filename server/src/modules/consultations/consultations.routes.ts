import { Router } from 'express';
import { requireAuth } from '../../middlewares/auth';
import { listConsultationsHandler } from './consultations.controller';

const router = Router();
router.use(requireAuth);
router.get('/', listConsultationsHandler); // médecin : ses consultations ; assureur : toutes

export default router;
