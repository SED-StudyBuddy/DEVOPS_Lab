import { Router } from 'express'
import * as studyRoomsController from '../../controllers/studyrooms_controller.js'

const router = Router()

router.get('/api/study-rooms', async (req, res) => {
  try {
    const rooms = await studyRoomsController.getAllRooms(req.query)
    console.log(rooms)
    res.status(200).json(rooms)
  } catch (err) {
    res.status(err.status || 500).json({ message: err.message })
  }
})

router.get('/api/study-rooms/:roomId', async (req, res) => {
  try {
    const room = await studyRoomsController.getRoomById(req.params.roomId)
    res.status(200).json(room)
  } catch (err) {
    res.status(err.status || 500).json({ message: err.message })
  }
})

router.post('/api/study-rooms', async (req, res) => {
  try {
    const room = await studyRoomsController.createRoom(req.body)
    res.status(201).json(room)
  } catch (err) {
    res.status(err.status || 500).json({ message: err.message })
  }
})

router.put('/api/study-rooms/:roomId', async (req, res) => {
  try {
    const room = await studyRoomsController.updateRoom(
      req.params.roomId,
      req.body
    )
    res.status(200).json(room)
  } catch (err) {
    res.status(err.status || 500).json({ message: err.message })
  }
})

router.delete('/api/study-rooms/:roomId', async (req, res) => {
  try {
    await studyRoomsController.deleteRoom(req.params.roomId)
    res.status(200).json({ message: 'Study room deleted successfully' })
  } catch (err) {
    res.status(err.status || 500).json({ message: err.message })
  }
})

export default router
