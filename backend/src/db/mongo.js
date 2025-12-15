import { MongoClient } from 'mongodb'

let client
let db

export async function connectToDb () {
  if (db) return db

  client = new MongoClient(process.env.MONGO_URI)
  await client.connect()
  db = client.db()

  console.log(`Connected to MongoDB database: ${db.databaseName}`)
  return db
}

export function getDb () {
  if (!db) {
    throw new Error('Database not initialized. Call connectToDb() first.')
  }
  return db
}

export async function closeDb () {
  if (client) await client.close()
  db = null
}
