import { Router } from 'express'
import * as usersController from '../../controllers/users_controller.js'

const router = Router()

router.get(
  '/api/users',
  usersController.getUsers
)

router.get(
  '/api/users/:userId',
  usersController.getUserById
)

router.post(
  '/api/users',
  usersController.createUser
)

router.put(
  '/api/users/:userId',
  usersController.updateUser
)

router.delete(
  '/api/users/:userId',
  usersController.deleteUser
)

export default router
