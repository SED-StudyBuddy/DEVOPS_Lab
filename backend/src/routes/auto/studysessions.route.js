import { Router } from 'express'
import * as studySessionsController from '../../controllers/studysessions_controller.js'

const router = Router()

router.get(
  '/api/study-sessions',
  studySessionsController.getStudySessions
)

router.get(
  '/api/study-sessions/:sessionId',
  studySessionsController.getStudySessionById
)

router.post(
  '/api/study-sessions',
  studySessionsController.createStudySession
)

router.put(
  '/api/study-sessions/:sessionId',
  studySessionsController.updateStudySession
)

router.delete(
  '/api/study-sessions/:sessionId',
  studySessionsController.deleteStudySession
)

router.post(
  '/api/study-sessions/:sessionId/join',
  studySessionsController.joinStudySession
)

router.post(
  '/api/study-sessions/:sessionId/leave',
  studySessionsController.leaveStudySession
)

export default router
