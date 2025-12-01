import request from 'supertest'
import app from '../src/app.js'
import { describe, expect, it } from 'vitest'

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
      email: 'gabin.salon@example.com',
      role: 'student',
      school: 'ESILV',
      schoolYear: 4,
      major: 'DIA'
    }

    const res = await request(app)
      .post('/api/users')
      .send(payload)

    expect(res.status).toBe(201)
    expect(res.body).toHaveProperty('id')
    expect(res.body.fullName).toBe(payload.fullName)
    expect(res.body.email).toBe(payload.email)
  })

  it('POST /api/users returns 400 when required fields are missing', async () => {
    const res = await request(app)
      .post('/api/users')
      .send({ email: 'no-name@example.com' })

    expect(res.status).toBe(400)
    expect(res.body).toHaveProperty('message')
  })

  it('GET /api/users/:id returns 404 for unknown user', async () => {
    const res = await request(app).get('/api/users/999999')
    expect(res.status).toBe(404)
  })

  it('PUT /api/users/:id updates an existing user', async () => {
    // create a user first
    const createRes = await request(app)
      .post('/api/users')
      .send({
        fullName: 'Temp User',
        email: 'temp@example.com',
        role: 'student'
      })

    const id = createRes.body.id

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
        email: 'deleteme@example.com',
        role: 'student'
      })

    const id = createRes.body.id

    const delRes = await request(app).delete(`/api/users/${id}`)
    expect(delRes.status).toBe(200)

    const getRes = await request(app).get(`/api/users/${id}`)
    expect(getRes.status).toBe(404)
  })
})
