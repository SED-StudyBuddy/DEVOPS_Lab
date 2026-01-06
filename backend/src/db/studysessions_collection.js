import { getDb } from './mongo.js'
import { ObjectId } from 'mongodb'

const COLLECTION = 'studysessions'

export async function getStudySessions (filter = {}) {
  const db = getDb()
  return db.collection(COLLECTION).find(filter).toArray()
}

export async function getStudySessionById (id) {
  const db = getDb()
  return db.collection(COLLECTION).findOne({ _id: new ObjectId(id) })
}

export async function createStudySession (session) {
  const db = getDb()
  const result = await db.collection(COLLECTION).insertOne(session)
  return { ...session, _id: result.insertedId }
}

export async function updateStudySession (id, updates) {
  const db = getDb()

  const res = await db.collection(COLLECTION).updateOne(
    { _id: new ObjectId(id) },
    { $set: updates }
  )

  if (!res.matchedCount) return null
  return getStudySessionById(id)
}

export async function deleteStudySession (id) {
  const db = getDb()
  const res = await db.collection(COLLECTION).deleteOne({ _id: new ObjectId(id) })
  return res.deletedCount > 0
}

export async function joinStudySession (id, userId) {
  const db = getDb()

  const session = await getStudySessionById(id)
  if (!session) return null

  if (!session.participants.includes(userId)) {
    session.participants.push(userId)
  }

  await db.collection(COLLECTION).updateOne(
    { _id: new ObjectId(id) },
    { $set: { participants: session.participants } }
  )

  return session
}

export async function leaveStudySession (id, userId) {
  const db = getDb()
  const session = await getStudySessionById(id)
  if (!session) return null

  session.participants = session.participants.filter(p => p !== userId)

  await db.collection(COLLECTION).updateOne(
    { _id: new ObjectId(id) },
    { $set: { participants: session.participants } }
  )

  return session
}
