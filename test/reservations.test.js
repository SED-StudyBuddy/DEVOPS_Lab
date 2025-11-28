import request from 'supertest'
import app from '../src/app.js'
import { describe, expect, it } from 'vitest'

describe('Reservations API', () => {
  it('should fetch all reservations', async () => {
    const res = await request(app).get('/api/reservations')
    expect(res.statusCode).toEqual(200)
    expect(res.body).toBeInstanceOf(Array)
    expect(res.body.length).toBeGreaterThan(0)
  })

  it('should fetch a specific reservation by ID', async () => {
    const res = await request(app).get('/api/reservations/1')
    expect(res.statusCode).toEqual(200)
    expect(res.body).toHaveProperty('id', 1)
  })

  it('should return 404 for a non-existent reservation', async () => {
    const res = await request(app).get('/api/reservations/999')
    expect(res.statusCode).toEqual(404)
    expect(res.body).toHaveProperty('message', 'Reservation not found')
  })

  it('should filter reservations by room ID', async () => {
    const res = await request(app).get('/api/reservations?roomId=1')
    expect(res.statusCode).toEqual(200)
    expect(res.body.every(reservation => reservation.roomId === 1)).toBe(true)
  })

  it('should create a new reservation', async () => {
    const newReservation = {
      roomId: 1,
      user: 'Charlie',
      date: '2025-12-02',
      startTime: '12:00',
      endTime: '13:00'
    }
    const res = await request(app).post('/api/reservations').send(newReservation)
    expect(res.statusCode).toEqual(201)
    expect(res.body).toHaveProperty('id')
    expect(res.body).toMatchObject(newReservation)
  })

  it('should not create a reservation with missing fields', async () => {
    const incompleteReservation = {
      roomId: 1,
      user: 'Charlie',
      date: '2024-07-02'
    }

    const res = await request(app).post('/api/reservations').send(incompleteReservation)
    expect(res.statusCode).toEqual(400)
    expect(res.body).toHaveProperty('message', 'Missing required fields')
  })

  it('should not create a reservation with conflicting time slot', async () => {
    const conflictingReservation = {
      roomId: 1,
      user: 'Dave',
      date: '2025-12-01',
      startTime: '10:00',
      endTime: '11:00'
    }

    const res = await request(app).post('/api/reservations').send(conflictingReservation)
    expect(res.statusCode).toEqual(409)
    expect(res.body).toHaveProperty('message', 'Time slot already booked for this room')
  })

  it('should not create a reservation in the past', async () => {
    const pastReservation = {
      roomId: 1,
      user: 'Eve',
      date: '2023-01-01',
      startTime: '10:00',
      endTime: '11:00'
    }

    const res = await request(app).post('/api/reservations').send(pastReservation)
    expect(res.statusCode).toEqual(400)
    expect(res.body).toHaveProperty('message', 'Reservation date must be in the future')
  })

  it('should not create a reservation with end time before start time', async () => {
    const invalidTimeReservation = {
      roomId: 1,
      user: 'Frank',
      date: '2026-12-02',
      startTime: '12:00',
      endTime: '11:00'
    }

    const res = await request(app).post('/api/reservations').send(invalidTimeReservation)
    expect(res.statusCode).toEqual(400)
    expect(res.body).toHaveProperty('message', 'End time must be after start time')
  })

  it('should not create a reservations with an invalid roomId', async () => {
    const invalidRoomReservation = {
      roomId: 999,
      user: 'Grace',
      date: '2025-12-02',
      startTime: '12:00',
      endTime: '13:00'
    }

    const res = await request(app).post('/api/reservations').send(invalidRoomReservation)
    expect(res.statusCode).toEqual(400)
    expect(res.body).toHaveProperty('message', 'Invalid roomId')
  })

  it('should update an existing reservation', async () => {
    const updatedData = {
      user: 'Alice Updated',
      startTime: '10:30',
      endTime: '11:30'
    }

    const res = await request(app).put('/api/reservations/1').send(updatedData)
    expect(res.statusCode).toEqual(200)
    expect(res.body).toHaveProperty('id', 1)
    expect(res.body).toMatchObject(updatedData)
  })

  it('should return 404 when updating a non-existent reservation', async () => {
    const res = await request(app).put('/api/reservations/999').send({ user: 'NonExistent', startTime: '10:00', endTime: '11:00' })
    expect(res.statusCode).toEqual(404)
    expect(res.body).toHaveProperty('message', 'Reservation not found')
  })

  it('should not update a reservation with invalid data', async () => {
    const res = await request(app).put('/api/reservations/1').send({ startTime: '12:00', endTime: '11:00' })
    expect(res.statusCode).toEqual(400)
    expect(res.body).toHaveProperty('message', 'End time must be after start time')
  })
})
