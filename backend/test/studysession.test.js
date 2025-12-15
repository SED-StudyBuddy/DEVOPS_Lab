import request from 'supertest'
import { describe, it, expect, beforeAll } from 'vitest'
import app from '../src/app.js'
import { connectToDb } from '../src/db/mongo.js'

describe('Study Sessions API (MongoDB integration)', () => {
  let createdSessionId

  const OWNER_ID = 'student_test@esilv.fr'
  const OTHER_USER_ID = 'another_student@esilv.fr'

  beforeAll(async () => {
    await connectToDb()
  })

  // ---------------------------------------------------------------------------
  // GET /api/study-sessions
  // ---------------------------------------------------------------------------
  it('GET /api/study-sessions returns an array of study sessions', async () => {
    const res = await request(app).get('/api/study-sessions')

    expect(res.status).toBe(200)
    expect(Array.isArray(res.body)).toBe(true)
  })

  // ---------------------------------------------------------------------------
  // POST /api/study-sessions
  // ---------------------------------------------------------------------------
  it('POST /api/study-sessions creates a new study session', async () => {
    const payload = {
      name: 'Advanced Algorithms Review',
      subject: 'Computer Science',
      dateTime: '2026-01-10T10:00:00Z',
      location: 'Virtual (Google Meet)',
      type: 'virtual',
      capacity: 10,
      ownerId: OWNER_ID,
      public: true
    }

    const res = await request(app)
      .post('/api/study-sessions')
      .send(payload)

    expect(res.status).toBe(201)
    expect(res.body).toHaveProperty('_id')
    expect(res.body.name).toBe(payload.name)
    expect(res.body.participants).toContain(OWNER_ID)

    createdSessionId = res.body._id
  })

  // ---------------------------------------------------------------------------
  // POST /api/study-sessions (400)
  // ---------------------------------------------------------------------------
  it('POST /api/study-sessions returns 400 when required fields are missing', async () => {
    const res = await request(app)
      .post('/api/study-sessions')
      .send({ name: 'Invalid session' })

    expect(res.status).toBe(400)
  })

  // ---------------------------------------------------------------------------
  // GET /api/study-sessions/:id
  // ---------------------------------------------------------------------------
  it('GET /api/study-sessions/:id returns a study session', async () => {
    const res = await request(app).get(
      `/api/study-sessions/${createdSessionId}`
    )

    expect(res.status).toBe(200)
    expect(res.body).toHaveProperty('_id', createdSessionId)
  })

  // ---------------------------------------------------------------------------
  // GET /api/study-sessions/:id (404)
  // ---------------------------------------------------------------------------
  it('GET /api/study-sessions/:id returns 404 for unknown session', async () => {
    const res = await request(app).get(
      '/api/study-sessions/507f1f77bcf86cd799439011'
    )

    expect(res.status).toBe(404)
  })

  // ---------------------------------------------------------------------------
  // PUT /api/study-sessions/:id
  // ---------------------------------------------------------------------------
  it('PUT /api/study-sessions/:id updates a study session', async () => {
    const res = await request(app)
      .put(`/api/study-sessions/${createdSessionId}`)
      .send({
        capacity: 8
      })

    expect(res.status).toBe(200)
    expect(res.body.capacity).toBe(8)
  })

  // ---------------------------------------------------------------------------
  // POST /api/study-sessions/:id/join
  // ---------------------------------------------------------------------------
  it('POST /api/study-sessions/:id/join allows a user to join a public session', async () => {
    const res = await request(app)
      .post(`/api/study-sessions/${createdSessionId}/join`)
      .send({ userId: OTHER_USER_ID })

    expect(res.status).toBe(200)
    expect(res.body.participants).toContain(OTHER_USER_ID)
  })

  // ---------------------------------------------------------------------------
  // POST /api/study-sessions/:id/leave
  // ---------------------------------------------------------------------------
  it('POST /api/study-sessions/:id/leave allows a user to leave a session', async () => {
    const res = await request(app)
      .post(`/api/study-sessions/${createdSessionId}/leave`)
      .send({ userId: OTHER_USER_ID })

    expect(res.status).toBe(200)
    expect(res.body.participants).not.toContain(OTHER_USER_ID)
  })

  // ---------------------------------------------------------------------------
  // DELETE /api/study-sessions/:id
  // ---------------------------------------------------------------------------
  it('DELETE /api/study-sessions/:id deletes a study session', async () => {
    const res = await request(app).delete(
      `/api/study-sessions/${createdSessionId}`
    )

    expect(res.status).toBe(200)

    const check = await request(app).get(
      `/api/study-sessions/${createdSessionId}`
    )

    expect(check.status).toBe(404)
  })
})
