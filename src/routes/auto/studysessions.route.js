import { Router } from 'express'
import { v4 as uuidv4 } from 'uuid'

const router = Router()

// -----------------------------------------------------------------------------
// In-memory mock data
// -----------------------------------------------------------------------------
let studySessions = [
  {
    id: 101,
    name: 'L2 Mathematical Analysis Revisions',
    subject: 'Mathematics',
    dateTime: '2025-12-15T14:00:00Z',
    location: 'Room 8204-Sorbonne Campus',
    type: 'presential',
    capacity: 6,
    participants: [
      'marie.dupont@esilv.fr',
      'user1@esilv.fr',
      'user2@esilv.fr'
    ],
    ownerId: 'marie.dupont@esilv.fr',
    public: true,
    zoomLink: null
  },
  {
    id: 102,
    name: 'Geopolitical Debate',
    subject: 'Political Science',
    dateTime: '2025-12-16T18:00:00Z',
    location: 'Café "Le Procope"',
    type: 'external',
    capacity: 8,
    participants: ['lucas.bernard@sciencespo.fr'],
    ownerId: 'lucas.bernard@sciencespo.fr',
    public: true,
    zoomLink: null
  },
  {
    id: 103,
    name: 'Private C++ Practice',
    subject: 'Computer Science',
    dateTime: '2025-12-17T10:00:00Z',
    location: 'Virtual (Zoom)',
    type: 'virtual',
    capacity: 4,
    participants: ['owner1@esilv.fr', 'invitee1@esilv.fr'],
    ownerId: 'owner1@esilv.fr',
    public: false,
    zoomLink: 'https://zoom.us/j/1234567890'
  }
]

// -----------------------------------------------------------------------------
// Validation helper
// -----------------------------------------------------------------------------
const validateSessionData = (data, isNew = false) => {
  if (
    !data.name ||
    !data.subject ||
    !data.dateTime ||
    !data.location ||
    !data.type ||
    !data.capacity
  ) {
    return 'Missing required fields: name, subject, dateTime, location, type, capacity.'
  }

  if (
    typeof data.name !== 'string' ||
    typeof data.subject !== 'string' ||
    typeof data.location !== 'string' ||
    typeof data.type !== 'string'
  ) {
    return 'Invalid data types for string fields.'
  }

  if (typeof data.capacity !== 'number' || data.capacity <= 0) {
    return 'Capacity must be a positive number.'
  }

  if (isNew && !data.ownerId) {
    return 'Missing ownerId for a new session.'
  }

  if (isNaN(Date.parse(data.dateTime))) {
    return 'Invalid date/time format.'
  }

  return null
}

// -----------------------------------------------------------------------------
// GET /api/study-sessions → Get all sessions (filters optional)
// -----------------------------------------------------------------------------
router.get('/api/study-sessions', (req, res) => {
  let filtered = [...studySessions]
  const { subject, type, minCapacity } = req.query

  if (subject) {
    filtered = filtered.filter(s =>
      s.subject.toLowerCase().includes(subject.toLowerCase())
    )
  }

  if (type) {
    filtered = filtered.filter(s => s.type === type)
  }

  if (minCapacity) {
    const minCap = parseInt(minCapacity)
    if (!isNaN(minCap)) {
      filtered = filtered.filter(s => s.capacity >= minCap)
    }
  }

  // Sort by date
  filtered.sort((a, b) => new Date(a.dateTime) - new Date(b.dateTime))

  res.status(200).json(filtered)
})

// -----------------------------------------------------------------------------
// GET /api/study-sessions/:id → Get specific session
// -----------------------------------------------------------------------------
router.get('/api/study-sessions/:id', (req, res) => {
  const session = studySessions.find(s => s.id === req.params.id)

  if (!session) {
    return res.status(404).json({ message: 'Study session not found' })
  }

  res.status(200).json(session)
})

// -----------------------------------------------------------------------------
// POST /api/study-sessions → Create a new session
// -----------------------------------------------------------------------------
router.post('/api/study-sessions', (req, res) => {
  const data = req.body
  const validationError = validateSessionData(data, true)

  if (validationError) {
    return res.status(400).json({ message: validationError })
  }

  // Conflict check: same location + same time
  const isConflict = studySessions.some(
    s =>
      s.location === data.location &&
      new Date(s.dateTime).getTime() === new Date(data.dateTime).getTime()
  )

  if (isConflict) {
    return res.status(409).json({
      message: 'A session already exists at this location and time.'
    })
  }

  const newSession = {
    id: uuidv4(),
    ...data,
    participants: data.participants || [data.ownerId],
    public: data.public !== undefined ? data.public : true,
    zoomLink:
      data.type === 'virtual'
        ? `https://zoom.us/j/${Math.floor(Math.random() * 1e10)}`
        : null
  }

  studySessions.push(newSession)
  res.status(201).json(newSession)
})

// -----------------------------------------------------------------------------
// PUT /api/study-sessions/:id → Update a session
// -----------------------------------------------------------------------------
router.put('/api/study-sessions/:id', (req, res) => {
  const session = studySessions.find(s => s.id === req.params.id)

  if (!session) {
    return res.status(404).json({ message: 'Study session not found' })
  }

  const data = req.body
  const validationError = validateSessionData({ ...session, ...data })

  if (validationError) {
    if (data.capacity && (typeof data.capacity !== 'number' || data.capacity <= 0)) {
      return res.status(400).json({ message: 'Capacity must be a positive number.' })
    }

    if (data.dateTime && isNaN(Date.parse(data.dateTime))) {
      return res.status(400).json({ message: 'Invalid date/time format.' })
    }

    const stringFields = ['name', 'subject', 'location', 'type', 'ownerId']
    for (const field of stringFields) {
      if (data[field] && typeof data[field] !== 'string') {
        return res.status(400).json({
          message: `Invalid data type for ${field}.`
        })
      }
    }
  }

  Object.assign(session, data)
  res.status(200).json(session)
})

// -----------------------------------------------------------------------------
// DELETE /api/study-sessions/:id → Delete a session
// -----------------------------------------------------------------------------
router.delete('/api/study-sessions/:id', (req, res) => {
  const initialLength = studySessions.length
  studySessions = studySessions.filter(s => s.id !== req.params.id)

  if (studySessions.length === initialLength) {
    return res.status(404).json({ message: 'Study session not found' })
  }

  res.status(200).json({ message: 'Study session deleted successfully' })
})

// -----------------------------------------------------------------------------
// POST /api/study-sessions/:id/join → Join a session
// -----------------------------------------------------------------------------
router.post('/api/study-sessions/:id/join', (req, res) => {
  const { userId } = req.body
  const session = studySessions.find(s => s.id === req.params.id)

  if (!session) {
    return res.status(404).json({ message: 'Study session not found' })
  }

  if (session.participants.includes(userId)) {
    return res.status(409).json({ message: 'User is already a participant.' })
  }

  if (session.participants.length >= session.capacity) {
    return res.status(409).json({
      message: 'Cannot join session: Maximum capacity reached'
    })
  }

  if (!session.public) {
    return res.status(202).json({
      message: 'Request to join sent to session owner.'
    })
  }

  session.participants.push(userId)
  res.status(200).json({
    message: 'Successfully joined session',
    participants: session.participants
  })
})

// -----------------------------------------------------------------------------
// POST /api/study-sessions/:id/leave → Leave a session
// -----------------------------------------------------------------------------
router.post('/api/study-sessions/:id/leave', (req, res) => {
  const { userId } = req.body
  const session = studySessions.find(s => s.id === req.params.id)

  if (!session) {
    return res.status(404).json({ message: 'Study session not found' })
  }

  const oldCount = session.participants.length
  session.participants = session.participants.filter(p => p !== userId)

  if (session.participants.length === oldCount) {
    return res.status(409).json({
      message: 'User is not a participant in this session.'
    })
  }

  res.status(200).json({
    message: 'Successfully left session',
    participants: session.participants
  })
})

export default router
