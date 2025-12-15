import { Router } from 'express'
import * as studySessionsController from '../../controllers/studysessions_controller.js'

const router = Router()

<<<<<<< HEAD
router.get(
  '/api/study-sessions',
  studySessionsController.getStudySessions
)
=======
// -----------------------------------------------------------------------------
// In-memory mock data
// -----------------------------------------------------------------------------
let studySessions = [
  {
    _id: '692d7376362876fd8bf12dc5',
    sessionName: 'L2 Mathematical Analysis Revisions',
    subject: 'Mathematics',
    dateTime: '2025-12-15T14:00:00Z',
    roomId: '692d72b1a10abba2468ec063',
    sessionType: 'presential',
    capacity: 6,
    participantsIds: [
      '692d7376362876fd8bf12dc3',
      '692d7376362876fd8bf12dc4',
      '693ec399ad877d97c0eba385'
    ],
    ownerId: '692d7376362876fd8bf12dc3',
    public: true,
    zoomLink: null
  }
]
>>>>>>> origin/main

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
