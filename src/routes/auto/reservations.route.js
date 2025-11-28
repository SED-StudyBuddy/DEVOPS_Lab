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

  const result = validateInput(req.body)

  if (result.error) {
    return res.status(result.status).json({ message: result.message })
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
  return res.status(201).json(newReservation)
})

router.put('/api/reservations/:reservationId', (req, res) => {
  const reservationId = parseInt(req.params.reservationId)

  if (!reservationId) {
    return res.status(400).json({ message: 'Missing reservation Id' })
  }

  const reservation = reservations.find(r => r.id === reservationId)

  if (!reservation) {
    return res.status(404).json({ message: 'Reservation not found' })
  }

  const { roomId, user, date, startTime, endTime } = req.body

  const result = validateInput(req.body)

  if (result.error) {
    return res.status(result.status).json({ message: result.message })
  }

  reservation.roomId = roomId || reservation.roomId
  reservation.user = user || reservation.user
  reservation.date = date || reservation.date
  reservation.startTime = startTime || reservation.startTime
  reservation.endTime = endTime || reservation.endTime

  res.status(200).json(reservation)
})

router.delete('/api/reservations/:reservationId', (req, res) => {
  const reservationId = parseInt(req.params.reservationId)
  const index = reservations.findIndex(r => r.id === reservationId)
  if (index === -1) {
    return res.status(404).json({ message: 'Reservation not found' })
  }

  reservations.splice(index, 1)
  res.status(200).json({ message: 'Study room deleted successfully' })
})

function validateInput (reservationInfo) {
  const { roomId, date, startTime, endTime } = reservationInfo || {}

  const error = (status, message) => ({ error: true, status, message })

  if (reservationInfo.roomId & typeof reservationInfo.roomId !== 'number' ||
    reservationInfo.user & typeof reservationInfo.user !== 'string' ||
    reservationInfo.date & typeof reservationInfo.date !== 'string' ||
    reservationInfo.startTime & typeof reservationInfo.startTime !== 'string' ||
    reservationInfo.endTime & typeof reservationInfo.endTime !== 'string') {
    return error(400, 'Invalid data types for fields')
  }

  if (reservationInfo.roomId & !studyRooms.some(room => room.id === roomId)) {
    return error(400, 'Invalid roomId')
  }

  if (new Date(date) < new Date()) {
    return error(400, 'Reservation date must be in the future')
  }

  if (startTime >= endTime) {
    return error(400, 'End time must be after start time')
  }

  if (startTime < '08:00' || endTime > '22:00') {
    return error(400, 'Reservations must be between 08:00 and 22:00')
  }

  const hasConflict = reservations.some(r =>
    r.roomId === roomId &&
    r.date === date &&
    (
      (startTime < r.endTime && endTime > r.startTime)
    )
  )

  if (hasConflict) {
    return error(409, 'Time slot already booked for this room')
  }

  return { error: false }
}

export default router
