import { getDb } from './mongo.js'
import { ObjectId } from 'mongodb'

const COLLECTION = 'studyrooms'

export async function getAllRooms (filter = {}) {
  const db = await getDb()
  return db.collection(COLLECTION).find(filter).toArray()
}

export async function getRoomById (id) {
  const db = await getDb()
  return db.collection(COLLECTION).findOne({ _id: new ObjectId(id) })
}

export async function getRoomByName (name) {
  const db = await getDb()
  return db.collection(COLLECTION).findOne({ name })
}

export async function createRoom (room) {
  const db = await getDb()
  const result = await db.collection(COLLECTION).insertOne(room)
  return { ...room, _id: result.insertedId }
}

export async function updateRoom (id, updates) {
  const db = await getDb()
  await db.collection(COLLECTION).updateOne(
    { _id: new ObjectId(id) },
    { $set: updates }
  )
  return getRoomById(id)
}

export async function deleteRoom (id) {
  const db = await getDb()
  await db.collection(COLLECTION).deleteOne({ _id: new ObjectId(id) })
}
