import { Router } from 'express'
import { studyRooms } from '../../db/data.js'

const router = Router()

router.get('/api/study-rooms', (_req, res) => {
  if (!studyRooms || studyRooms.length === 0) {
    return res.status(404).json([])
  }

  let rooms = studyRooms

  if (_req.query.available) {
    const isAvailable = _req.query.available === 'true'
    rooms = rooms.filter(room => room.available === isAvailable)
  }

  if (_req.query.minCapacity) {
    const minCapacity = parseInt(_req.query.minCapacity)
    rooms = rooms.filter(room => room.capacity >= minCapacity)
  }

  res.status(200).json(rooms)
})

router.get('/api/study-rooms/:roomId', (_req, res) => {
  const roomId = parseInt(_req.params.roomId)
  const studyRoom = studyRooms.find(room => room.id === roomId)

  if (!studyRoom) {
    return res.status(404).json({ message: 'Study room not found' })
  }

  res.status(200).json(studyRoom)
})

router.post('/api/study-rooms', (_req, res) => {
  const data = _req.body
  if (!data.name || !data.capacity || !data.equipment) {
    return res.status(400).json({ message: 'Study room data incomplete' })
  }

  if (typeof data.name !== 'string' || typeof data.capacity !== 'number' || !Array.isArray(data.equipment)) {
    return res.status(400).json({ message: 'Invalid study room data types' })
  }

  if (data.capacity <= 0) {
    return res.status(400).json({ message: 'Capacity must be a positive number' })
  }

  if (studyRooms.find(room => room.name === data.name)) {
    return res.status(409).json({ message: 'Study room with this name already exists' })
  }

  const newRoom = _req.body
  newRoom.id = studyRooms.length + 1
  studyRooms.push(newRoom)
  res.status(201).json(newRoom)
})

router.put('/api/study-rooms/:roomId', (_req, res) => {
  const roomId = parseInt(_req.params.roomId)
  const studyRoom = studyRooms.find(room => room.id === roomId)

  if (!studyRoom) {
    return res.status(404).json({ message: 'Study room not found' })
  }

  const data = _req.body
  if (data.name && typeof data.name !== 'string') {
    return res.status(400).json({ message: 'Invalid name type' })
  }
  if (data.capacity && (typeof data.capacity !== 'number' || data.capacity <= 0)) {
    return res.status(400).json({ message: 'Invalid capacity' })
  }
  if (data.equipment && !Array.isArray(data.equipment)) {
    return res.status(400).json({ message: 'Invalid equipment type' })
  }
  Object.assign(studyRoom, data)
  res.status(200).json(studyRoom)
})

router.delete('/api/study-rooms/:roomId', (_req, res) => {
  const roomId = parseInt(_req.params.roomId)
  const room = studyRooms.find(room => room.id === roomId)

  if (!room) {
    return res.status(404).json({ message: 'Study room not found' })
  }

  const index = studyRooms.indexOf(room)
  studyRooms.splice(index, 1)
  res.status(200).json({ message: 'Study room deleted successfully' })
})

export default router
