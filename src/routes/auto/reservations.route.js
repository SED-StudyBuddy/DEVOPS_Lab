import { Router } from 'express'
import { studyRooms, reservations } from '../../db/data.js'

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

router.post('/api/reservations', (req, res) => {
  const { roomId, user, date, startTime, endTime } = req.body

  if (!roomId || !user || !date || !startTime || !endTime) {
    return res.status(400).json({ message: 'Missing required fields' })
  }

  if (typeof roomId !== 'number' || typeof user !== 'string' || typeof date !== 'string' ||
      typeof startTime !== 'string' || typeof endTime !== 'string') {
    return res.status(400).json({ message: 'Invalid data types for fields' })
  }

  if (reservations.some(r => r.roomId === roomId && r.date === date &&
      ((startTime >= r.startTime && startTime < r.endTime) ||
       (endTime > r.startTime && endTime <= r.endTime) ||
       (startTime <= r.startTime && endTime >= r.endTime)))) {
    return res.status(409).json({ message: 'Time slot already booked for this room' })
  }

  if (new Date(date) < new Date()) {
    return res.status(400).json({ message: 'Reservation date must be in the future' })
  }

  if (startTime >= endTime) {
    return res.status(400).json({ message: 'End time must be after start time' })
  }

  if (startTime < '08:00' || endTime > '22:00') {
    return res.status(400).json({ message: 'Reservations must be between 08:00 and 22:00' })
  }

  if (studyRooms.findIndex(room => room.id === roomId) === -1) {
    return res.status(400).json({ message: 'Invalid roomId' })
  }

  const newReservation = {
    id: reservations.length + 1,
    roomId,
    user,
    date,
    startTime,
    endTime
  }
  reservations.push(newReservation)
  res.status(201).json(newReservation)
})

export default router
