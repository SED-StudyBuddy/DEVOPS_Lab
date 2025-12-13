import { Router } from 'express'
import * as reservationsController from '../../controllers/reservations_controller.js'

const router = Router()

router.get('/api/reservations', async (req, res) => {
  try {
    const reservations = await reservationsController.getReservations(req.query)
    res.status(200).json(reservations)
  } catch (err) {
    res.status(err.status || 500).json({ message: err.message })
  }
})

router.get('/api/reservations/:reservationId', async (req, res) => {
  try {
    const reservation = await reservationsController.getReservationById(
      req.params.reservationId
    )
    res.status(200).json(reservation)
  } catch (err) {
    res.status(err.status || 500).json({ message: err.message })
  }
})

router.post('/api/reservations', async (req, res) => {
  try {
    const reservation = await reservationsController.createReservation(req.body)
    res.status(201).json(reservation)
  } catch (err) {
    res.status(err.status || 500).json({ message: err.message })
  }
})

router.put('/api/reservations/:reservationId', async (req, res) => {
  try {
    const reservation = await reservationsController.updateReservation(
      req.params.reservationId,
      req.body
    )
    res.status(200).json(reservation)
  } catch (err) {
    res.status(err.status || 500).json({ message: err.message })
  }
})

router.delete('/api/reservations/:reservationId', async (req, res) => {
  try {
    await reservationsController.deleteReservation(req.params.reservationId)
    res.status(200).json({ message: 'Reservation deleted successfully' })
  } catch (err) {
    res.status(err.status || 500).json({ message: err.message })
  }
})

export default router
