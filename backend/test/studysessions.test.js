import request from 'supertest'
import app from './src/app.js'
import { describe, expect, it, beforeAll, afterAll } from 'vitest'
import { closeDb } from '../src/db/mongo.js'
import { initApp } from '../src/app.js'

function uniqueSessionName (prefix = 'TestSession') {
  return `${prefix}-${Date.now()}-${Math.floor(Math.random() * 1e6)}`
}

describe('Study Sessions API', () => {
  beforeAll(async () => {
    await initApp()
  }, 20_000)

  afterAll(async () => {
    await closeDb()
  })

  it('GET /api/study-sessions returns an array of study sessions', async () => {
    const res = await request(app).get('/api/study-sessions')
    expect(res.status).toBe(200)
    expect(Array.isArray(res.body)).toBe(true)
  })

  it('POST /api/study-sessions creates a new study session when data is valid', async () => {
    const payload = {
      name: uniqueSessionName('Math Study'),
      subject: 'Calculus', // Changé 'topic' en 'subject'
      dateTime: new Date().toISOString(), // Changé 'startTime' en 'dateTime'
      location: 'Library Room 301',
      type: 'physical', // Ajouté car requis par le contrôleur
      capacity: 10, // Changé 'maxParticipants' en 'capacity'
      ownerId: 'user123', // Ajouté car requis par le contrôleur
      public: true
    }

    const res = await request(app)
      .post('/api/study-sessions')
      .send(payload)

    expect(res.status).toBe(201)
    expect(res.body).toHaveProperty('_id')
    expect(res.body.name).toBe(payload.name)
    expect(res.body.subject).toBe(payload.subject)
  })

  it('POST /api/study-sessions returns 400 when required fields are missing', async () => {
    const res = await request(app)
      .post('/api/study-sessions')
      .send({ name: uniqueSessionName('Incomplete') })

    expect(res.status).toBe(400)
    expect(res.body).toHaveProperty('message')
  })

  it('GET /api/study-sessions/:sessionId returns 404 for unknown session', async () => {
    const res = await request(app).get('/api/study-sessions/507f1f77bcf86cd799439011')
    expect(res.status).toBe(404)
  })

  it('GET /api/study-sessions/:sessionId returns a specific study session', async () => {
    const createRes = await request(app)
      .post('/api/study-sessions')
      .send({
        name: uniqueSessionName('Physics Study'),
        subject: 'Quantum Mechanics',
        dateTime: new Date().toISOString(),
        location: 'Lab A',
        type: 'physical',
        capacity: 5,
        ownerId: 'user456'
      })

    const sessionId = createRes.body._id
    const res = await request(app).get(`/api/study-sessions/${sessionId}`)

    expect(res.status).toBe(200)
    expect(res.body._id).toBe(sessionId)
    expect(res.body.subject).toBe('Quantum Mechanics')
  })

  it('PUT /api/study-sessions/:sessionId updates an existing study session', async () => {
    const createRes = await request(app)
      .post('/api/study-sessions')
      .send({
        name: uniqueSessionName('Temp Session'),
        subject: 'Original Topic',
        dateTime: new Date().toISOString(),
        location: 'Room 202',
        type: 'physical',
        capacity: 20,
        ownerId: 'user789'
      })

    const sessionId = createRes.body._id

    const res = await request(app)
      .put(`/api/study-sessions/${sessionId}`)
      .send({
        subject: 'Updated Topic'
      })

    expect(res.status).toBe(200)
    expect(res.body.subject).toBe('Updated Topic')
  })

  it('DELETE /api/study-sessions/:sessionId deletes an existing study session', async () => {
    const createRes = await request(app)
      .post('/api/study-sessions')
      .send({
        name: uniqueSessionName('Delete Me'),
        subject: 'Temporary',
        dateTime: new Date().toISOString(),
        location: 'Trash',
        type: 'physical',
        capacity: 1,
        ownerId: 'user000'
      })

    const sessionId = createRes.body._id

    const delRes = await request(app).delete(`/api/study-sessions/${sessionId}`)
    expect(delRes.status).toBe(200)

    const getRes = await request(app).get(`/api/study-sessions/${sessionId}`)
    expect(getRes.status).toBe(404)
  })

  it('POST /api/study-sessions/:sessionId/join allows a user to join a session', async () => {
    const createRes = await request(app)
      .post('/api/study-sessions')
      .send({
        name: uniqueSessionName('Join Test'),
        subject: 'Group Study',
        dateTime: new Date().toISOString(),
        location: 'Online',
        type: 'virtual',
        capacity: 10,
        ownerId: 'host123'
      })

    const sessionId = createRes.body._id

    const res = await request(app)
      .post(`/api/study-sessions/${sessionId}/join`)
      .send({ userId: 'user123' })

    expect(res.status).toBe(200)
    expect(res.body.participants).toContain('user123')
  })

  it('POST /api/study-sessions/:sessionId/leave allows a user to leave a session', async () => {
    const createRes = await request(app)
      .post('/api/study-sessions')
      .send({
        name: uniqueSessionName('Leave Test'),
        subject: 'Group Study',
        dateTime: new Date().toISOString(),
        location: 'Online',
        type: 'virtual',
        capacity: 10,
        ownerId: 'host456'
      })

    const sessionId = createRes.body._id

    // On rejoint d'abord (ou on vérifie si le service l'ajoute par défaut via ownerId)
    await request(app).post(`/api/study-sessions/${sessionId}/join`).send({ userId: 'user456' })

    const res = await request(app)
      .post(`/api/study-sessions/${sessionId}/leave`)
      .send({ userId: 'user456' })

    expect(res.status).toBe(200)
    expect(res.body.participants).not.toContain('user456')
  })
})
