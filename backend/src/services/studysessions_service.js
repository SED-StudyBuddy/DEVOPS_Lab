import * as studySessionsCollection from '../db/studysessions_collection.js'
import { DomainError } from '../errors/DomainError.js'
import { ObjectId } from 'mongodb'

export async function getStudySessions (filterParam = {}) {
  const filter = {}
  if (filterParam.subject) filter.subject = filterParam.subject
  if (filterParam.type) filter.type = filterParam.type
  if (filterParam.ownerId && ObjectId.isValid(filterParam.ownerId)) {
    filter.ownerId = new ObjectId(filterParam.ownerId)
  }
  return studySessionsCollection.getStudySessions(filter)
}

export async function getStudySessionById (id) {
  if (!ObjectId.isValid(id)) throw new DomainError('INVALID_SESSION', 'Invalid sessionId format')
  const session = await studySessionsCollection.getStudySessionById(id)
  if (!session) throw new DomainError('SESSION_NOT_FOUND', 'Study session not found')
  return session
}

export async function createStudySession (data) {
  validateStudySession(data)
  return studySessionsCollection.createStudySession(data)
}

export async function updateStudySession (id, updates) {
  if (!ObjectId.isValid(id)) throw new DomainError('INVALID_SESSION', 'Invalid sessionId format')
  const existing = await studySessionsCollection.getStudySessionById(id)
  if (!existing) throw new DomainError('SESSION_NOT_FOUND', 'Study session not found')
  validateStudySession({ ...existing, ...updates }, { partial: true })
  return studySessionsCollection.updateStudySession(id, updates)
}

export async function deleteStudySession (id) {
  if (!ObjectId.isValid(id)) throw new DomainError('INVALID_SESSION', 'Invalid sessionId format')
  const session = await studySessionsCollection.getStudySessionById(id)
  if (!session) throw new DomainError('SESSION_NOT_FOUND', 'Study session not found')
  await studySessionsCollection.deleteStudySession(id)
}

export async function joinStudySession (id, userId) {
  if (!ObjectId.isValid(id)) throw new DomainError('INVALID_SESSION', 'Invalid sessionId format')
  const session = await studySessionsCollection.getStudySessionById(id)
  if (!session) throw new DomainError('SESSION_NOT_FOUND', 'Session not found')
  const updatedParticipants = session.participants ? [...session.participants, userId] : [userId]
  return studySessionsCollection.updateStudySession(id, { participants: updatedParticipants })
}

export async function leaveStudySession (id, userId) {
  if (!ObjectId.isValid(id)) throw new DomainError('INVALID_SESSION', 'Invalid sessionId format')
  const session = await studySessionsCollection.getStudySessionById(id)
  if (!session) throw new DomainError('SESSION_NOT_FOUND', 'Session not found')
  const updatedParticipants = (session.participants || []).filter(p => String(p) !== String(userId))
  return studySessionsCollection.updateStudySession(id, { participants: updatedParticipants })
}

function validateStudySession (data, { partial = false } = {}) {
  const { name, subject, dateTime, ownerId } = data
  if (!partial && (!name || !subject || !dateTime || !ownerId)) {
    throw new DomainError('INVALID_INPUT', 'Missing required fields')
  }
};
