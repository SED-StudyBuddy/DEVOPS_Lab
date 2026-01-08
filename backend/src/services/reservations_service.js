import * as reservationsCollection from '../db/reservations_collection.js'
import * as roomsCollection from '../db/studyrooms_collection.js'
import { DomainError } from '../errors/DomainError.js'
import { ObjectId } from 'mongodb'

export async function getReservations (query = {}) {
  const filter = {}

  if (query.roomId && query.roomId !== 'all') {
    if (!ObjectId.isValid(query.roomId)) {
      throw new DomainError('INVALID_ROOM', 'Invalid roomId format')
    }
    filter.roomId = new ObjectId(query.roomId)
  }

  if (query.user) {
    filter.user = {
      $regex: query.user,
      $options: 'i'
    }
  }

  if (query.date) {
    filter.date = query.date
    if (query.time) {
      filter.startTime = { $lte: query.time }
      filter.endTime = { $gte: query.time }
    }
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

  const roomExists =
    await roomsCollection.getStudyRoomById(data.roomId)

  if (!roomExists) {
    throw new DomainError('INVALID_ROOM', 'Invalid roomId')
  }

  const conflict = await hasReservationConflict({
    roomId: data.roomId,
    date: data.date,
    startTime: data.startTime,
    endTime: data.endTime
  })

  if (conflict) {
    throw new DomainError(
      'ROOM_CONFLICT',
      'This room is already reserved for the selected time'
    )
  }

  return reservationsCollection.createReservation({
    ...data,
    status: 'Scheduled'
  })
}

export async function updateReservation (id, updates) {
  const existing =
    await reservationsCollection.getReservationById(id)

  if (!existing) {
    throw new DomainError(
      'RESERVATION_NOT_FOUND',
      'Reservation not found'
    )
  }

  const merged = {
    ...existing,
    ...updates
  }

  validateReservation(merged, { partial: true })

  const roomExists =
    await roomsCollection.getStudyRoomById(merged.roomId)

  if (!roomExists) {
    throw new DomainError('INVALID_ROOM', 'Invalid roomId')
  }

  if (merged.status === 'Scheduled') {
    const conflict = await hasReservationConflict({
      reservationId: id,
      roomId: merged.roomId,
      date: merged.date,
      startTime: merged.startTime,
      endTime: merged.endTime
    })

    if (conflict) {
      throw new DomainError(
        'TIME_CONFLICT',
        'This time slot is already booked'
      )
    }
  }

  return reservationsCollection.updateReservation(id, updates)
}

export async function deleteReservation (id) {
  const reservation =
    await reservationsCollection.getReservationById(id)

  if (!reservation) {
    throw new DomainError(
      'RESERVATION_NOT_FOUND',
      'Reservation not found'
    )
  }

  return reservationsCollection.deleteReservation(id)
}

function validateReservation (data, { partial = false } = {}) {
  const { roomId, user, date, startTime, endTime } = data

  if (!partial) {
    if (!roomId || !user || !date || !startTime || !endTime) {
      throw new DomainError(
        'INVALID_INPUT',
        'Missing required fields'
      )
    }
  }

  if (startTime && endTime && startTime >= endTime) {
    throw new DomainError(
      'INVALID_TIME',
      'End time must be after start time'
    )
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
        'Reservation date must be today or in the future'
      )
    }
  }
}

async function hasReservationConflict ({
  reservationId = null,
  roomId,
  date,
  startTime,
  endTime
}) {
  const start = toDateTime(date, startTime)
  const end = toDateTime(date, endTime)

  const query = {
    roomId: new ObjectId(roomId),
    date,
    status: { $ne: 'Cancelled' }
  }

  if (reservationId) {
    query._id = { $ne: new ObjectId(reservationId) }
  }

  const existing =
    await reservationsCollection.getReservations(query)

  return existing.some(r => {
    const existingStart = toDateTime(r.date, r.startTime)
    const existingEnd = toDateTime(r.date, r.endTime)

    return start < existingEnd && end > existingStart
  })
}

function toDateTime (date, time) {
  const [h, m] = time.split(':').map(Number)
  const d = new Date(date)
  d.setHours(h, m, 0, 0)
  return d
}
