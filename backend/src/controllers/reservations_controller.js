import * as service from '../services/reservations_service.js'
import { DomainError } from '../errors/DomainError.js'

export async function getReservations (req, res) {
  const reservations = await service.getReservations(req.query.roomId)
  res.json(reservations)
}

export async function getReservationById (req, res) {
  try {
    const reservation = await service.getReservationById(req.params.reservationId)
    res.json(reservation)
  } catch (err) {
    if (err instanceof DomainError) {
      return res.status(404).json({ message: err.message })
    }
    res.status(500).json({ message: 'Internal server error' })
  }
}

export async function createReservation (req, res) {
  try {
    const reservation = await service.createReservation(req.body)
    res.status(201).json(reservation)
  } catch (err) {
    if (err instanceof DomainError) {
      const statusMap = {
        INVALID_INPUT: 400,
        INVALID_TIME: 400,
        OUTSIDE_OPENING_HOURS: 400,
        INVALID_DATE: 400,
        INVALID_ROOM: 400,
        TIME_CONFLICT: 409
      }
      return res
        .status(statusMap[err.code] || 400)
        .json({ message: err.message })
    }
    res.status(500).json({ message: 'Internal server error' })
  }
}

export async function updateReservation (req, res) {
  try {
    const reservation = await service.updateReservation(req.params.reservationId, req.body)
    res.status(200).json(reservation)
  } catch (err) {
    if (err instanceof DomainError) {
      return res.status(400).json({ message: err.message })
    }
    res.status(500).json({ message: 'Internal server error' })
  }
}

export async function deleteReservation (req, res) {
  try {
    await service.deleteReservation(req.params.reservationId)
    res.json({ message: 'Reservation deleted successfully' })
  } catch (err) {
    if (err instanceof DomainError) {
      return res.status(404).json({ message: err.message })
    }
    res.status(500).json({ message: 'Internal server error' })
  }
}
