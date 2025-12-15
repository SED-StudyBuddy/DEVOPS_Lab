import { connectToDb } from '../db/mongo.js'
import * as studySessionsCollection from '../db/studysessions_collection.js'

export async function getStudySessions (req, res, next) {
  try {
    await connectToDb()

    const filter = {}
    if (req.query.subject) filter.subject = req.query.subject
    if (req.query.type) filter.type = req.query.type

    const sessions = await studySessionsCollection.getStudySessions(filter)
    res.status(200).json(sessions)
  } catch (err) {
    next(err)
  }
}

export async function getStudySessionById (req, res, next) {
  try {
    await connectToDb()
    const session = await studySessionsCollection.getStudySessionById(req.params.sessionId)

    if (!session) {
      return res.status(404).json({ message: 'Study session not found' })
    }

    res.status(200).json(session)
  } catch (err) {
    next(err)
  }
}

export async function createStudySession (req, res, next) {
  try {
    await connectToDb()
    const data = req.body

    const required = ['name', 'subject', 'dateTime', 'location', 'type', 'capacity', 'ownerId']
    for (const field of required) {
      if (!data[field]) {
        return res.status(400).json({ message: 'Missing required fields' })
      }
    }

    const newSession = {
      ...data,
      participants: [data.ownerId],
      public: data.public ?? true,
      zoomLink: data.type === 'virtual'
        ? `https://zoom.us/j/${Math.floor(Math.random() * 1e10)}`
        : null
    }

    const created = await studySessionsCollection.createStudySession(newSession)
    res.status(201).json(created)
  } catch (err) {
    next(err)
  }
}

export async function updateStudySession (req, res, next) {
  try {
    await connectToDb()
    const updated = await studySessionsCollection.updateStudySession(
      req.params.sessionId,
      req.body
    )

    if (!updated) {
      return res.status(404).json({ message: 'Study session not found' })
    }

    res.status(200).json(updated)
  } catch (err) {
    next(err)
  }
}

export async function deleteStudySession (req, res, next) {
  try {
    await connectToDb()
    const deleted = await studySessionsCollection.deleteStudySession(req.params.sessionId)

    if (!deleted) {
      return res.status(404).json({ message: 'Study session not found' })
    }

    res.status(200).json({ message: 'Study session deleted successfully' })
  } catch (err) {
    next(err)
  }
}

export async function joinStudySession (req, res, next) {
  try {
    await connectToDb()
    const { userId } = req.body

    const session = await studySessionsCollection.joinStudySession(
      req.params.sessionId,
      userId
    )

    if (!session) {
      return res.status(404).json({ message: 'Study session not found' })
    }

    res.status(200).json({
      message: 'Successfully joined session',
      participants: session.participants
    })
  } catch (err) {
    next(err)
  }
}

export async function leaveStudySession (req, res, next) {
  try {
    await connectToDb()
    const { userId } = req.body

    const session = await studySessionsCollection.leaveStudySession(
      req.params.sessionId,
      userId
    )

    if (!session) {
      return res.status(404).json({ message: 'Study session not found' })
    }

    res.status(200).json({
      message: 'Successfully left session',
      participants: session.participants
    })
  } catch (err) {
    next(err)
  }
}
