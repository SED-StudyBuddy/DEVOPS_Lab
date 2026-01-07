import { Router } from 'express'
import * as authController from '../../controllers/auth_controller.js'

const router = Router()

router.post('/api/auth/login', authController.login)
router.get('/api/auth/me', authController.me)

export default router
