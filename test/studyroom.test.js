import request from 'supertest'
import { describe, it, expect, beforeAll, afterAll } from 'vitest'
import { getDb, closeDb } from '../src/db/mongo.js'
import { ObjectId } from 'mongodb'
import app, { initApp } from '../src/app.js'

describe('Study Rooms API (MongoDB integration)', () => {
  let db
  let testRoomId

  const testRoom = {
    name: 'TEST_ROOM__DO_NOT_USE',
    capacity: 99,
    available: true,
    equipment: ['TestBoard']
  }

  beforeAll(async () => {
    await initApp()
    db = await getDb()

    await db.collection('studyrooms').deleteMany({
      name: testRoom.name
    })
  }, 20_000)

  afterAll(async () => {
    if (testRoomId) {
      await db.collection('studyrooms').deleteOne({
        _id: new ObjectId(testRoomId)
      })
    }

    await closeDb()
  })

  it('creates a new study room', async () => {
    const res = await request(app)
      .post('/api/study-rooms')
      .send(testRoom)

    expect(res.status).toBe(201)
    expect(res.body).toHaveProperty('_id')
    expect(res.body.name).toBe(testRoom.name)

    testRoomId = res.body._id
  })

  it('fetches the created study room by id', async () => {
    const res = await request(app)
      .get(`/api/study-rooms/${testRoomId}`)

    expect(res.status).toBe(200)
    expect(res.body.name).toBe(testRoom.name)
  })

  it('updates the study room', async () => {
    const res = await request(app)
      .put(`/api/study-rooms/${testRoomId}`)
      .send({
        capacity: 50,
        available: false
      })

    expect(res.status).toBe(200)
    expect(res.body.capacity).toBe(50)
    expect(res.body.available).toBe(false)
  })

  it('deletes the study room', async () => {
    const res = await request(app)
      .delete(`/api/study-rooms/${testRoomId}`)

    expect(res.status).toBe(200)
    expect(res.body.message).toMatch(/deleted/i)
  })

  it('returns 404 when fetching deleted room', async () => {
    const res = await request(app)
      .get(`/api/study-rooms/${testRoomId}`)

    expect(res.status).toBe(404)
  })
})
