import { getDb } from './mongo.js'
import { ObjectId } from 'mongodb'

const COLLECTION = 'reservations'

export async function getReservations (filter = {}) {
  const db = await getDb()

  if (filter.roomId) {
    filter.roomId = new ObjectId(filter.roomId)
  }

  return db.collection(COLLECTION).find(filter).toArray()
}

export async function getReservationById (id) {
  const db = await getDb()
  return db.collection(COLLECTION).findOne({ _id: new ObjectId(id) })
}

export async function createReservation (reservation) {
  const db = await getDb()
  const result = await db.collection(COLLECTION).insertOne({
    ...reservation,
    roomId: new ObjectId(reservation.roomId)
  })
  return { ...reservation, _id: result.insertedId }
}

export async function updateReservation (id, updates) {
  const db = await getDb()

  if (updates.roomId) {
    updates.roomId = new ObjectId(updates.roomId)
  }

  await db.collection(COLLECTION).updateOne(
    { _id: new ObjectId(id) },
    { $set: updates }
  )

  return getReservationById(id)
}

export async function deleteReservation (id) {
  const db = await getDb()
  await db.collection(COLLECTION).deleteOne({ _id: new ObjectId(id) })
}

export async function hasConflict (roomId, date, startTime, endTime, excludeId) {
  const db = await getDb()

  const query = {
    roomId: new ObjectId(roomId),
    date,
    startTime: { $lt: endTime },
    endTime: { $gt: startTime }
  }

  if (excludeId) {
    query._id = { $ne: new ObjectId(excludeId) }
  }

  return db.collection(COLLECTION).findOne(query)
}

export async function hasReservationsForRoom (roomId) {
  const db = await getDb()
  return Boolean(
    await db.collection('reservations').findOne({
      roomId: new ObjectId(roomId)
    })
  )
}
