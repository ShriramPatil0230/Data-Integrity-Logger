import { Router } from 'express';
import { createLog, listLogs, verifyLog, deleteLog } from '../controllers/logController.js';
import { checkDatabase } from '../middlewares/dbCheck.js';
import { requireAuth } from '../middlewares/auth.js';

const router = Router();

router.get('/', requireAuth, checkDatabase, listLogs);
router.post('/', requireAuth, checkDatabase, createLog);
router.post('/:id/verify', requireAuth, checkDatabase, verifyLog);
router.delete('/:id', requireAuth, checkDatabase, deleteLog);

export default router;


