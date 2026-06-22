import { Router } from 'express';
import rateLimit from 'express-rate-limit';
import { loginHandler, logoutHandler, meHandler, registerHandler } from './auth.controller';
import { requireAuth } from '../../middlewares/auth';

const router = Router();

// Limite stricte sur le login (anti brute-force — BNF1).
const loginLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  limit: 20,
  standardHeaders: true,
  legacyHeaders: false,
  message: { message: 'Trop de tentatives de connexion — réessayez plus tard.' },
});

router.post('/login', loginLimiter, loginHandler);
router.post('/register', registerHandler);
router.post('/logout', requireAuth, logoutHandler);
router.get('/me', requireAuth, meHandler);

export default router;
