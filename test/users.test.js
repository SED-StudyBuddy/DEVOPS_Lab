import request from 'supertest'
import app from '../src/app.js'
import { describe, expect, it } from 'vitest'

function uniqueEmail (prefix = 'testuser') {
  return `${prefix}-${Date.now()}-${Math.floor(Math.random() * 1e6)}@example.com`
}


describe('Users API', () => {
  it('GET /api/users returns an array of users', async () => {
    const res = await request(app).get('/api/users')

    expect(res.status).toBe(200)
    expect(Array.isArray(res.body)).toBe(true)
    expect(res.body.length).toBeGreaterThan(0)
  })

  it('POST /api/users creates a new user when data is valid', async () => {
    const payload = {
      fullName: 'Gabin Salon',
      email: uniqueEmail('gabin.salon@example.com'),
      role: 'student',
      school: 'ESILV',
      schoolYear: 4,
      major: 'DIA'
    }

    const res = await request(app)
      .post('/api/users')
      .send(payload)

    expect(res.status).toBe(201)
    expect(res.body).toHaveProperty('_id')
    expect(res.body.fullName).toBe(payload.fullName)
    expect(res.body.email).toBe(payload.email)
  })

  it('POST /api/users returns 400 when required fields are missing', async () => {
    const res = await request(app)
      .post('/api/users')
      .send({ email: uniqueEmail('no-name@example.com') })

    expect(res.status).toBe(400)
    expect(res.body).toHaveProperty('message')
  })

  it('GET /api/users/:id returns 404 for unknown user', async () => {
    const res = await request(app).get('/api/users/507f1f77bcf86cd799439011')
    expect(res.status).toBe(404)
  })

  it('PUT /api/users/:id updates an existing user', async () => {
    // create a user first
    const createRes = await request(app)
      .post('/api/users')
      .send({
        fullName: 'Temp User',
        email: uniqueEmail('temp@example.com'),
        role: 'student'
      })

    const id = createRes.body._id

    const res = await request(app)
      .put(`/api/users/${id}`)
      .send({ fullName: 'Updated User' })

    expect(res.status).toBe(200)
    expect(res.body.fullName).toBe('Updated User')
  })

  it('DELETE /api/users/:id deletes an existing user', async () => {
    // create a user to delete
    const createRes = await request(app)
      .post('/api/users')
      .send({
        fullName: 'Delete Me',
        email: uniqueEmail('deleteme@example.com'),
        role: 'student'
      })

    const id = createRes.body._id

    const delRes = await request(app).delete(`/api/users/${id}`)
    expect(delRes.status).toBe(200)

    const getRes = await request(app).get(`/api/users/${id}`)
    expect(getRes.status).toBe(404)
  })
})
