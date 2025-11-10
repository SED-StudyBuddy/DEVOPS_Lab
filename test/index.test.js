import request from 'supertest'
import app from '../src/app.js'
import { describe, it, expect } from 'vitest'

describe('Server', () => {
  it('responds on GET /', async () => {
    const res = await request(app).get('/')
    expect(res.statusCode).toBe(200)
  })
})
