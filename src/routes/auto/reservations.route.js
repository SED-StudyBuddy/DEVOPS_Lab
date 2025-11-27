import { Router } from 'express'
import { reservations } from '../../db/data.js'

const router = Router()

router.get('/api/reservations', (_req, res) => {
  let reservationsArray = reservations

  if (_req.query.roomId) {
    const roomId = parseInt(_req.query.roomId)
    reservationsArray = reservations.filter(r => r.roomId === roomId)
  }

  res.status(200).json(reservationsArray)
})

router.get('/api/reservations/:reservationId', (_req, res) => {
  const reservationId = parseInt(_req.params.reservationId)

  const reservation = reservations.find(r => r.id === reservationId)
  if (!reservation) {
    return res.status(404).json({ message: 'Reservation not found' })
  }

  res.status(200).json(reservation)
})
