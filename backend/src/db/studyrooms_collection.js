import { getDb } from './mongo.js'
import { ObjectId } from 'mongodb'

const COLLECTION = 'studyrooms'

export async function getAllStudyRooms (filter = {}) {
  const db = await getDb()
  return db.collection(COLLECTION).find(filter).toArray()
}

export async function getStudyRoomById (id) {
  const db = await getDb()
  return db.collection(COLLECTION).findOne({ _id: new ObjectId(id) })
}

export async function getStudyRoomByName (name) {
  const db = await getDb()
  return db.collection(COLLECTION).findOne({ name })
}

export async function createStudyRoom (room) {
  const db = await getDb()
  const result = await db.collection(COLLECTION).insertOne(room)
  return { ...room, _id: result.insertedId }
}

export async function updateStudyRoom (id, updates) {
  const db = await getDb()
  await db.collection(COLLECTION).updateOne(
    { _id: new ObjectId(id) },
    { $set: updates }
  )
  return getStudyRoomById(id)
}

export async function deleteStudyRoom (id) {
  const db = await getDb()
  await db.collection(COLLECTION).deleteOne({ _id: new ObjectId(id) })
}
