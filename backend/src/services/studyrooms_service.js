import * as sessionsCollection from '../db/studysessions_collection.js' // CHANGEMENT: Nouvelle collection
import * as reservationsCollection from '../db/reservations_collection.js' // Garder les réservations si elles sont liées aux sessions
import { DomainError } from '../errors/DomainError.js'
import { ObjectId } from 'mongodb'

// =========================================================================
// Remplacement de getStudyRooms par getStudySessions
// =========================================================================

export async function getStudySessions (query) {
  let sessions = await sessionsCollection.getAllStudySessions()

  if (query.isPublic !== undefined) { // Exemple de filtre sur les sessions
    const isPublic = query.isPublic === 'true'
    sessions = sessions.filter(s => s.isPublic === isPublic)
  }

  if (query.minDurationMinutes !== undefined) { // Exemple de filtre sur la durée
    const minDurationMinutes = Number(query.minDurationMinutes)
    sessions = sessions.filter(s => s.durationMinutes >= minDurationMinutes)
  }

  return sessions
}

// =========================================================================
// Remplacement de getStudyRoomById par getStudySessionById
// =========================================================================

export async function getStudySessionById (sessionId) {
  const session = await sessionsCollection.getStudySessionById(sessionId)
  if (!session) {
    throw new DomainError('SESSION_NOT_FOUND', 'Study session not found') // CHANGEMENT: Erreur SESSION_NOT_FOUND
  }
  return session
}

// =========================================================================
// Remplacement de createStudyRoom par createStudySession
// =========================================================================

export async function createStudySession (data) {
  validateStudySessionInput(data)

  const existing = await sessionsCollection.getStudySessionByName(data.name) // Vérification par nom
  if (existing) {
    throw new DomainError(
      'DUPLICATE_SESSION', // CHANGEMENT: Erreur DUPLICATE_SESSION
      'Study session with this name already exists'
    )
  }

  // Assurez-vous d'ajouter ici le créateur/propriétaire de la session
  // data.creatorId = new ObjectId(data.creatorId)

  return sessionsCollection.createStudySession(data)
}

// =========================================================================
// Remplacement de updateStudyRoom par updateStudySession
// =========================================================================

export async function updateStudySession (sessionId, data) {
  const session = await sessionsCollection.getStudySessionById(sessionId)
  if (!session) {
    throw new DomainError('SESSION_NOT_FOUND', 'Study session not found') // CHANGEMENT: Erreur SESSION_NOT_FOUND
  }

  validateStudySessionInput(data, { partial: true })

  if (data.name !== undefined) {
    const existing = await sessionsCollection.getStudySessionByName(data.name)
    if (existing && existing._id.toString() !== sessionId.toString()) {
      throw new DomainError(
        'DUPLICATE_SESSION', // CHANGEMENT: Erreur DUPLICATE_SESSION
        'Study session with this name already exists'
      )
    }
  }

  return sessionsCollection.updateStudySession(sessionId, data)
}

// =========================================================================
// Remplacement de deleteStudyRoom par deleteStudySession
// =========================================================================

export async function deleteStudySession (sessionId) {
  const session = await sessionsCollection.getStudySessionById(sessionId)
  if (!session) {
    throw new DomainError('SESSION_NOT_FOUND', 'Study session not found') // CHANGEMENT: Erreur SESSION_NOT_FOUND
  }

  // Vérification de dépendances (ex: reservations liées à cette session)
  const reservations = await reservationsCollection.getReservations({ sessionId: new ObjectId(sessionId) }) // CHANGEMENT: Chercher par sessionId

  if (reservations.length > 0) {
    throw new DomainError(
      'SESSION_HAS_RESERVATIONS', // CHANGEMENT: Erreur SESSION_HAS_RESERVATIONS
      'Cannot delete study session with existing reservations'
    )
  }

  await sessionsCollection.deleteStudySession(sessionId)
}

// =========================================================================
// Remplacement de validateStudyRoomInput par validateStudySessionInput
// (Adapté pour des champs de session comme name, topic, startTime)
// =========================================================================

function validateStudySessionInput (data, { partial = false } = {}) {
  const { name, topic, startTime, durationMinutes } = data

  if (!partial) {
    if (!name || !topic || !startTime || durationMinutes === undefined) {
      throw new DomainError(
        'INVALID_INPUT',
        'Study session data incomplete (requires name, topic, startTime, durationMinutes)'
      )
    }
  }

  if (name !== undefined && typeof name !== 'string') {
    throw new DomainError(
      'INVALID_INPUT',
      'Invalid name type'
    )
  }

  if (topic !== undefined && typeof topic !== 'string') {
    throw new DomainError(
      'INVALID_INPUT',
      'Invalid topic type'
    )
  }

  if (startTime !== undefined && (typeof startTime !== 'string' || isNaN(Date.parse(startTime)))) {
    throw new DomainError(
      'INVALID_INPUT',
      'Invalid startTime format (must be a valid date string)'
    )
  }

  if (
    durationMinutes !== undefined &&
    (typeof durationMinutes !== 'number' || durationMinutes <= 0)
  ) {
    throw new DomainError(
      'INVALID_INPUT',
      'Duration must be a positive number in minutes'
    )
  }
}
