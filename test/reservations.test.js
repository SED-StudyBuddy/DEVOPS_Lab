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
})
