import request from 'supertest'
import app from '../src/app.js'
import { describe, expect, it } from 'vitest'

describe('Study Room API', () => {
  it('should fetch all study rooms', async () => {
    const res = await request(app).get('/api/study-rooms')
    expect(res.statusCode).toEqual(200)
    expect(res.body).toBeInstanceOf(Array)
    expect(res.body.length).toBeGreaterThan(0)
  })

  it('should fetch a specific study room by ID', async () => {
    const res = await request(app).get('/api/study-rooms/1')
    expect(res.statusCode).toEqual(200)
    expect(res.body).toHaveProperty('id', 1)
  })

  it('should return 404 for a non-existent study room', async () => {
    const res = await request(app).get('/api/study-rooms/999')
    expect(res.statusCode).toEqual(404)
    expect(res.body).toHaveProperty('message', 'Study room not found')
  })
})
