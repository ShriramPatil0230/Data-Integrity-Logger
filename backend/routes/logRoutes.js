import { Router } from 'express';
import { createLog, listLogs, verifyLog, deleteLog, rehashLog } from '../controllers/logController.js';
import { checkDatabase } from '../middlewares/dbCheck.js';
import { requireAuth } from '../middlewares/auth.js';
import { writeLimiter } from '../middlewares/rateLimit.js';
import { body, param } from 'express-validator';
import { validate } from '../middlewares/validate.js';

const router = Router();

router.get('/', requireAuth, checkDatabase, listLogs);
router.post(
  '/',
  requireAuth,
  writeLimiter,
  checkDatabase,
  body('text').isString().trim().isLength({ min: 1, max: Number(process.env.MAX_TEXT_LENGTH || 65536) }),
  validate,
  createLog
);
router.post(
  '/:id/verify',
  requireAuth,
  writeLimiter,
  checkDatabase,
  param('id').isString().notEmpty(),
  validate,
  verifyLog
);
router.delete(
  '/:id',
  requireAuth,
  writeLimiter,
  checkDatabase,
  param('id').isString().notEmpty(),
  validate,
  deleteLog
);

router.post(
  '/:id/rehash',
  requireAuth,
  checkDatabase,
  param('id').isString().notEmpty(),
  validate,
  rehashLog
);

export default router;


