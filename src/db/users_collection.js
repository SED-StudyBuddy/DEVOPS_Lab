import { getDb } from './mongo.js'
import { ObjectId } from 'mongodb'

const COLLECTION = 'users'

export async function getUsers (filter = {}) {
  const db = getDb()
  return db.collection(COLLECTION).find(filter).toArray()
}

export async function getUserById (id) {
  const db = getDb()
  return db.collection(COLLECTION).findOne({ _id: new ObjectId(id) })
}

export async function getUserByEmail (email) {
  const db = getDb()
  return db.collection(COLLECTION).findOne({ email })
}

export async function createUser (user) {
  const db = getDb()
  const result = await db.collection(COLLECTION).insertOne(user)
  return { ...user, _id: result.insertedId }
}

export async function updateUser (id, updates) {
  const db = getDb()
  await db.collection(COLLECTION).updateOne(
    { _id: new ObjectId(id) },
    { $set: updates }
  )
  return getUserById(id)
}

export async function deleteUser (id) {
  const db = getDb()
  await db.collection(COLLECTION).deleteOne({ _id: new ObjectId(id) })
}
