import { Router } from 'express'
import * as studyRoomsController from '../../controllers/studyrooms_controller.js'

const router = Router()

router.get(
  '/api/study-rooms',
  studyRoomsController.getStudyRooms
)

router.get(
  '/api/study-rooms/:roomId',
  studyRoomsController.getStudyRoomById
)

router.post(
  '/api/study-rooms',
  studyRoomsController.createStudyRoom
)

router.put(
  '/api/study-rooms/:roomId',
  studyRoomsController.updateStudyRoom
)

router.delete(
  '/api/study-rooms/:roomId',
  studyRoomsController.deleteStudyRoom
)

export default router
