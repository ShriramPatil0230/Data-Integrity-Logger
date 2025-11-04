import { Router } from 'express'
import { requireAuth } from '../middlewares/auth.js'
import { checkDatabase } from '../middlewares/dbCheck.js'
import { body, param } from 'express-validator'
import { validate } from '../middlewares/validate.js'
import { anchorDay, getProof } from '../controllers/anchorController.js'

const router = Router()

router.post('/anchor-day', requireAuth, checkDatabase, body('date').optional().isString(), validate, anchorDay)
router.get('/logs/:id/proof', requireAuth, checkDatabase, param('id').isString(), validate, getProof)

export default router


