import { describe, it, expect } from 'vitest'
import { validateReservation } from '../src/controllers/reservations_controller.js'
import { reservations, studyRooms } from '../src/db/data.js'

describe('Reservation validation', () => {
  it('accepts a valid reservation', () => {
    const result = validateReservation(
      {
        roomId: 1,
        user: 'Bob',
        date: '2025-12-30',
        startTime: '11:30',
        endTime: '12:30'
      },
      reservations,
      studyRooms
    )

    expect(result.error).toBe(false)
  })

  it('rejects missing fields', () => {
    const result = validateReservation(
      { roomId: 1 },
      [],
      studyRooms
    )

    expect(result.error).toBe(true)
    expect(result.message).toBe('Missing required fields')
  })

  it('rejects invalid roomId', () => {
    const result = validateReservation(
      {
        roomId: 999,
        user: 'Bob',
        date: '2025-12-30',
        startTime: '12:00',
        endTime: '13:00'
      },
      [],
      studyRooms
    )

    expect(result.error).toBe(true)
    expect(result.message).toBe('Invalid roomId')
  })

  it('rejects overlapping reservations', () => {
    const result = validateReservation(
      {
        roomId: 1,
        user: 'Charlie',
        date: '2025-12-30',
        startTime: '10:30',
        endTime: '11:30'
      },
      reservations,
      studyRooms
    )

    expect(result.error).toBe(true)
    expect(result.message).toBe('Time slot already booked for this room')
  })

  it('rejects end time before start time', () => {
    const result = validateReservation(
      {
        roomId: 1,
        user: 'Dave',
        date: '2025-12-30',
        startTime: '12:00',
        endTime: '11:00'
      },
      [],
      studyRooms
    )

    expect(result.error).toBe(true)
    expect(result.message).toBe('End time must be after start time')
  })
})
