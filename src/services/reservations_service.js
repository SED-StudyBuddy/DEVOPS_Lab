import * as reservationsCollection from '../db/reservations_collection.js'
import * as roomsCollection from '../db/studyrooms_collection.js'
import { DomainError } from '../errors/DomainError.js'
import { ObjectId } from 'mongodb'

export async function getReservations (roomId = undefined) {
  const filter = {}

  if (
    roomId &&
    roomId !== 'undefined' &&
    roomId !== 'null'
  ) {
    if (!ObjectId.isValid(roomId)) {
      throw new DomainError('INVALID_ROOM', 'Invalid roomId format')
    }

    filter.roomId = new ObjectId(roomId)
  }

  return reservationsCollection.getReservations(filter)
}

export async function getReservationById (id) {
  const reservation = await reservationsCollection.getReservationById(id)
  if (!reservation) {
    throw new DomainError('RESERVATION_NOT_FOUND', 'Reservation not found')
  }
  return reservation
}

export async function createReservation (data) {
  validateReservation(data)
  const { roomId, date, startTime, endTime } = data

  const room = await roomsCollection.getStudyRoomById(roomId)
  if (!room) {
    throw new DomainError('INVALID_ROOM', 'Invalid roomId')
  }

  const existing = await reservationsCollection.getReservations({ roomId })
  const conflict = existing.some(r =>
    r.date === date &&
    startTime < r.endTime &&
    endTime > r.startTime
  )

  if (conflict) {
    throw new DomainError(
      'TIME_CONFLICT',
      'Time slot already booked for this room'
    )
  }

  return reservationsCollection.createReservation(data)
}

export async function updateReservation (id, updates) {
  const existingReservation =
    await reservationsCollection.getReservationById(id)

  if (!existingReservation) {
    throw new DomainError(
      'RESERVATION_NOT_FOUND',
      'Reservation not found'
    )
  }

  const merged = {
    ...existingReservation,
    ...updates
  }

  validateReservation(merged, { partial: true })

  const { roomId, date, startTime, endTime } = merged

  const room = await roomsCollection.getStudyRoomById(roomId)
  if (!room) {
    throw new DomainError('INVALID_ROOM', 'Invalid roomId')
  }

  const existing =
    await reservationsCollection.getReservations({ filter: { roomId } })

  const conflict = existing.some(r =>
    r.id !== id &&
    r.date === date &&
    startTime < r.endTime &&
    endTime > r.startTime
  )

  if (conflict) {
    throw new DomainError(
      'TIME_CONFLICT',
      'Time slot already booked for this room'
    )
  }

  return reservationsCollection.updateReservation(id, updates)
}

export async function deleteReservation (id) {
  const reservation = await reservationsCollection.getReservationById(id)
  if (!reservation) {
    throw new DomainError('RESERVATION_NOT_FOUND', 'Reservation not found')
  }

  await reservationsCollection.deleteReservation(id)
}

function validateReservation (data, { partial = false } = {}) {
  const { roomId, user, date, startTime, endTime } = data

  if (!partial) {
    if (!roomId || !user || !date || !startTime || !endTime) {
      throw new DomainError('INVALID_INPUT', 'Missing required fields')
    }
  }

  if (startTime && endTime && startTime >= endTime) {
    throw new DomainError('INVALID_TIME', 'End time must be after start time')
  }

  if (
    (startTime && startTime < '08:00') ||
    (endTime && endTime > '22:00')
  ) {
    throw new DomainError(
      'OUTSIDE_OPENING_HOURS',
      'Reservations must be between 08:00 and 22:00'
    )
  }

  if (date) {
    const today = new Date()
    today.setHours(0, 0, 0, 0)

    const reservationDate = new Date(date)
    reservationDate.setHours(0, 0, 0, 0)

    if (reservationDate < today) {
      throw new DomainError(
        'INVALID_DATE',
        'Reservation date must be in the future'
      )
    }
  }
}
