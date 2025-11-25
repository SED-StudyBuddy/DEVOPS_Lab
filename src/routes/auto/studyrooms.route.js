import { Router } from 'express'

const router = Router()

const studyRooms = [
  { id: 1, name: 'Study Room A', capacity: 4, available: true, equipment: ['Whiteboard', 'Projector'] },
  { id: 2, name: 'Study Room B', capacity: 6, available: false, equipment: ['TV', 'Conference Phone'] },
  { id: 3, name: 'Study Room C', capacity: 2, available: true, equipment: ['Bookshelf'] }
]

router.get('/api/study-rooms', (_req, res) => {
  if (!studyRooms || studyRooms.length === 0) {
    return res.status(404).json([])
  }

  res.status(200).json(studyRooms)
})

router.get('/api/study-rooms/:roomId', (_req, res) => {
  const roomId = parseInt(_req.params.roomId)
  const studyRoom = studyRooms.find(room => room.id === roomId)

  if (!studyRoom) {
    return res.status(404).json({ message: 'Study room not found' })
  }

  res.status(200).json(studyRoom)
})

export default router
