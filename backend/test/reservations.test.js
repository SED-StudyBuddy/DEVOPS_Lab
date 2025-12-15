import request from 'supertest'
import { describe, it, expect, beforeAll, afterAll } from 'vitest'
import { getDb, closeDb } from '../src/db/mongo.js'
import { ObjectId } from 'mongodb'
import app, { initApp } from '../src/app.js'

describe('Reservations API (MongoDB integration)', () => {
  let db
  let testRoomId
  let testReservationId

  const testRoom = {
    name: 'TEST_ROOM_FOR_RESERVATIONS',
    capacity: 10,
    available: true,
    equipment: ['Whiteboard']
  }

  const testReservation = {
    user: 'TEST_USER',
    date: '2026-12-30',
    startTime: '11:00',
    endTime: '12:00'
  }

  beforeAll(async () => {
    await initApp()
    db = await getDb()

    await db.collection('reservations').deleteMany({
      user: testReservation.user
    })

    await db.collection('studyrooms').deleteMany({
      name: testRoom.name
    })

    const roomRes = await request(app)
      .post('/api/study-rooms')
      .send(testRoom)

    testRoomId = roomRes.body._id
  }, 30_000)

  afterAll(async () => {
    if (testReservationId) {
      await db.collection('reservations').deleteOne({
        _id: new ObjectId(testReservationId)
      })
    }

    if (testRoomId) {
      await db.collection('studyrooms').deleteOne({
        _id: testRoomId
      })
    }

    await closeDb()
  })

  it('creates a new reservation', async () => {
    const res = await request(app)
      .post('/api/reservations')
      .send({
        ...testReservation,
        roomId: testRoomId
      })

    expect(res.status).toBe(201)
    expect(res.body).toHaveProperty('_id')
    expect(res.body.user).toBe(testReservation.user)

    testReservationId = res.body._id
  })

  it('fetches all reservations', async () => {
    const res = await request(app).get('/api/reservations')

    expect(res.status).toBe(200)
    expect(Array.isArray(res.body)).toBe(true)
    expect(res.body.length).toBeGreaterThan(0)
  })

  it('fetches the reservation by id', async () => {
    const res = await request(app).get(`/api/reservations/${testReservationId}`)

    expect(res.status).toBe(200)
    expect(res.body.user).toBe(testReservation.user)
  })

  it('fetches reservations by roomId', async () => {
    const res = await request(app).get(`/api/reservations?roomId=${testRoomId}`)
    expect(res.status).toBe(200)
    expect(res.body.length).toBeGreaterThan(0)
    expect(
      res.body.every(r => r.roomId === testRoomId)
    ).toBe(true)
  })

  it('updates the reservation', async () => {
    const res = await request(app)
      .put(`/api/reservations/${testReservationId}`)
      .send({
        startTime: '12:00',
        endTime: '13:00'
      })

    expect(res.status).toBe(200)
    expect(res.body.startTime).toBe('12:00')
    expect(res.body.endTime).toBe('13:00')
  })

  it('deletes the reservation', async () => {
    const res = await request(app)
      .delete(`/api/reservations/${testReservationId}`)

    expect(res.status).toBe(200)
    expect(res.body.message).toMatch(/deleted/i)
  })

  it('returns 404 when fetching deleted reservation', async () => {
    const res = await request(app)
      .get(`/api/reservations/${testReservationId}`)

    expect(res.status).toBe(404)
  })
})
