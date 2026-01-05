import StudySession from '../db/models/studysession.model.js'

/**
 * Récupère les sessions d'étude en fonction d'un filtre (ex: sujet, type).
 */
export const getStudySessions = async (filter = {}) => {
  return await StudySession.find(filter)
}

/**
 * Récupère une session par son ID unique.
 */
export const getStudySessionById = async (sessionId) => {
  return await StudySession.findById(sessionId)
}

/**
 * Crée une nouvelle session.
 */
export const createStudySession = async (sessionData) => {
  const session = new StudySession(sessionData)
  return await session.save()
}

/**
 * Met à jour une session.
 * { new: true } permet de récupérer l'objet après modification.
 */
export const updateStudySession = async (sessionId, updateData) => {
  return await StudySession.findByIdAndUpdate(sessionId, updateData, { new: true })
}

/**
 * Supprime une session.
 */
export const deleteStudySession = async (sessionId) => {
  return await StudySession.findByIdAndDelete(sessionId)
}

/**
 * Ajoute un utilisateur à la liste des participants.
 * $addToSet évite les doublons.
 */
export const joinStudySession = async (sessionId, userId) => {
  return await StudySession.findByIdAndUpdate(
    sessionId,
    { $addToSet: { participants: userId } },
    { new: true }
  )
}

/**
 * Retire un utilisateur de la liste des participants.
 * $pull retire l'élément du tableau.
 */
export const leaveStudySession = async (sessionId, userId) => {
  return await StudySession.findByIdAndUpdate(
    sessionId,
    { $pull: { participants: userId } },
    { new: true }
  )
}
