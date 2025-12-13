import * as reservationsCollection from '../db/reservations_collection.js'
import * as roomsCollection from '../db/studyrooms_collection.js'

const error = (status, message) => {
  const e = new Error(message)
  e.status = status
  return e
}

export async function getReservations (query) {
  const filter = {}

  if (query.roomId) {
    filter.roomId = query.roomId
  }

  return reservationsCollection.getReservations(filter)
}

export async function getReservationById (reservationId) {
  const reservation =
    await reservationsCollection.getReservationById(reservationId)

  if (!reservation) {
    throw error(404, 'Reservation not found')
  }

  return reservation
}

export async function createReservation (data) {
  validateReservationInput(data)

  const roomExists = await roomsCollection.getRoomById(data.roomId)
  if (!roomExists) {
    throw error(400, 'Invalid roomId')
  }

  const conflict = await reservationsCollection.hasConflict(
    data.roomId,
    data.date,
    data.startTime,
    data.endTime
  )

  if (conflict) {
    throw error(409, 'Time slot already booked for this room')
  }

  const reservation = {
    roomId: data.roomId,
    user: data.user,
    date: data.date,
    startTime: data.startTime,
    endTime: data.endTime,
    createdAt: new Date()
  }

  return reservationsCollection.createReservation(reservation)
}

export async function updateReservation (reservationId, data) {
  const existing =
    await reservationsCollection.getReservationById(reservationId)

  if (!existing) {
    throw error(404, 'Reservation not found')
  }

  validateReservationInput(data)

  const conflict = await reservationsCollection.hasConflict(
    data.roomId,
    data.date,
    data.startTime,
    data.endTime,
    reservationId
  )

  if (conflict) {
    throw error(409, 'Time slot already booked for this room')
  }

  return reservationsCollection.updateReservation(reservationId, data)
}

export async function deleteReservation (reservationId) {
  const existing =
    await reservationsCollection.getReservationById(reservationId)

  if (!existing) {
    throw error(404, 'Reservation not found')
  }

  await reservationsCollection.deleteReservation(reservationId)
}

function validateReservationInput (data) {
  if (!data || !data.roomId || !data.user || !data.date || !data.startTime || !data.endTime) {
    throw error(400, 'Missing required fields')
  }

  if (
    typeof data.roomId !== 'string' ||
    typeof data.user !== 'string' ||
    typeof data.date !== 'string' ||
    typeof data.startTime !== 'string' ||
    typeof data.endTime !== 'string'
  ) {
    throw error(400, 'Invalid data types for fields')
  }

  if (new Date(data.date) < new Date()) {
    throw error(400, 'Reservation date must be in the future')
  }

  if (data.startTime >= data.endTime) {
    throw error(400, 'End time must be after start time')
  }

  if (data.startTime < '08:00' || data.endTime > '22:00') {
    throw error(400, 'Reservations must be between 08:00 and 22:00')
  }
}

export function validateReservation (reservation, reservations, studyRooms) {
  const { roomId, user, date, startTime, endTime } = reservation

  if (!roomId || !user || !date || !startTime || !endTime) {
    return { error: true, message: 'Missing required fields' }
  }

  if (!studyRooms.some(r => r.id === roomId)) {
    return { error: true, message: 'Invalid roomId' }
  }

  if (new Date(date) < new Date()) {
    return { error: true, message: 'Reservation date must be in the future' }
  }

  if (startTime >= endTime) {
    return { error: true, message: 'End time must be after start time' }
  }

  const conflict = reservations.some(r =>
    r.roomId === roomId &&
    r.date === date &&
    startTime < r.endTime &&
    endTime > r.startTime
  )

  if (conflict) {
    return { error: true, message: 'Time slot already booked for this room' }
  }

  return { error: false }
}
