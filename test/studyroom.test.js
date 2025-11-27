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

  it('should filter study rooms by availability', async () => {
    const res = await request(app).get('/api/study-rooms?available=true')
    expect(res.statusCode).toEqual(200)
    expect(res.body.every(room => room.available === true)).toBe(true)
  })

  it('should filter study rooms by minimum capacity', async () => {
    const res = await request(app).get('/api/study-rooms?minCapacity=4')
    expect(res.statusCode).toEqual(200)
    expect(res.body.every(room => room.capacity >= 4)).toBe(true)
  })

  it('should create a new study room', async () => {
    const newRoom = {
      name: 'Study Room D',
      capacity: 6,
      available: true,
      equipment: ['Projector', 'Whiteboard']
    }
    const res = await request(app).post('/api/study-rooms').send(newRoom)
    expect(res.statusCode).toEqual(201)
    expect(res.body).toHaveProperty('id')
    expect(res.body).toMatchObject(newRoom)
  })

  it('should return 400 for incomplete study room data', async () => {
    const incompleteRoom = {
      name: 'Study Room E',
      capacity: 4
    }
    const res = await request(app).post('/api/study-rooms').send(incompleteRoom)
    expect(res.statusCode).toEqual(400)
    expect(res.body).toHaveProperty('message', 'Study room data incomplete')
  })

  it('should return 409 for duplicate study room name', async () => {
    const duplicateRoom = {
      name: 'Study Room A',
      capacity: 4,
      available: true,
      equipment: ['Whiteboard']
    }
    const res = await request(app).post('/api/study-rooms').send(duplicateRoom)
    expect(res.statusCode).toEqual(409)
    expect(res.body).toHaveProperty('message', 'Study room with this name already exists')
  })

  it('should edit a study room', async () => {
    const updatedRoom = {
      name: 'Study Room A - Updated',
      capacity: 5,
      available: false,
      equipment: ['Whiteboard', 'Projector', 'TV']
    }
    const res = await request(app).put('/api/study-rooms/1').send(updatedRoom)
    expect(res.statusCode).toEqual(200)
    expect(res.body).toHaveProperty('id', 1)
    expect(res.body).toMatchObject(updatedRoom)
  })

  it('should return 404 when editing a non-existent study room', async () => {
    const updatedRoom = {
      name: 'Non-existent Room',
      capacity: 5,
      available: false,
      equipment: ['Whiteboard']
    }
    const res = await request(app).put('/api/study-rooms/999').send(updatedRoom)
    expect(res.statusCode).toEqual(404)
    expect(res.body).toHaveProperty('message', 'Study room not found')
  })

  it('should return 400 for invalid data types when creating a study room', async () => {
    const invalidRoom = {
      name: 'Study Room F',
      capacity: 'large',
      available: true,
      equipment: 'Projector'
    }
    const res = await request(app).post('/api/study-rooms').send(invalidRoom)
    expect(res.statusCode).toEqual(400)
    expect(res.body).toHaveProperty('message', 'Invalid study room data types')
  })

  it('should return 400 for non-positive capacity when creating a study room', async () => {
    const invalidRoom = {
      name: 'Study Room G',
      capacity: -1,
      available: true,
      equipment: ['Projector']
    }
    const res = await request(app).post('/api/study-rooms').send(invalidRoom)
    expect(res.statusCode).toEqual(400)
    expect(res.body).toHaveProperty('message', 'Capacity must be a positive number')
  })
})
