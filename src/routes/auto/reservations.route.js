import { Router } from 'express'
import * as reservationsController from '../../controllers/reservations_controller.js'

const router = Router()

router.get(
  '/api/reservations',
  reservationsController.getReservations
)

router.get(
  '/api/reservations/:reservationId',
  reservationsController.getReservationById
)

router.post(
  '/api/reservations',
  reservationsController.createReservation
)

router.put(
  '/api/reservations/:reservationId',
  reservationsController.updateReservation
)

router.delete(
  '/api/reservations/:reservationId',
  reservationsController.deleteReservation
)

export default router
