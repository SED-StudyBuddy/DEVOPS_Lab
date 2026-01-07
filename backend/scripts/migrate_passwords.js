import dotenv from 'dotenv'
import path from 'node:path'
import { fileURLToPath } from 'node:url'
import { MongoClient } from 'mongodb'
import bcrypt from 'bcrypt'

const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)

dotenv.config({ path: path.resolve(__dirname, '../../.env') })

async function main () {
  const client = new MongoClient(process.env.MONGO_URI)
  await client.connect()
  const db = client.db()
  const users = db.collection('users')

  const cursor = users.find({
    password: { $exists: true, $type: 'string' },
    passwordHash: { $exists: false }
  })

  let updated = 0
  for await (const u of cursor) {
    const hash = await bcrypt.hash(u.password, 10)
    await users.updateOne(
      { _id: u._id },
      { $set: { passwordHash: hash }, $unset: { password: '' } }
    )
    updated++
  }

  console.log(`Migrated ${updated} users`)
  await client.close()
}

main().catch((e) => {
  console.error(e)
  process.exit(1)
})
