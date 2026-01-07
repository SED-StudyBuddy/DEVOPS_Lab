import dotenv from 'dotenv'
import path from 'node:path'
import { fileURLToPath } from 'node:url'
import { MongoClient } from 'mongodb'
import bcrypt from 'bcrypt'

const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)

dotenv.config({ path: path.resolve(__dirname, '../../.env') })

const MONGO_URI = process.env.MONGO_URI
if (!MONGO_URI) throw new Error('Missing MONGO_URI in .env')

const DEFAULT_PASSWORD = process.argv[2] || 'Password123!'
const SALT_ROUNDS = 10

function normalizeEmail (email) {
  return String(email || '').trim().toLowerCase()
}

async function main () {
  const client = new MongoClient(MONGO_URI)
  await client.connect()
  const db = client.db()
  const users = db.collection('users')

  // 1) Find duplicates by normalized email
  const all = await users
    .find({}, { projection: { email: 1, createdAt: 1 } })
    .toArray()

  const groups = new Map() // email -> [docs]
  for (const u of all) {
    const em = normalizeEmail(u.email)
    if (!em) continue
    if (!groups.has(em)) groups.set(em, [])
    groups.get(em).push(u)
  }

  const idsToDelete = []
  const keptIds = []

  // Keep rule:
  // - Prefer the one that has passwordHash already
  // - Otherwise keep the oldest (by createdAt if exists, else by ObjectId time)
  for (const [email, docs] of groups.entries()) {
    if (docs.length <= 1) continue

    // Load full docs for this email to decide properly (passwordHash check)
    const fullDocs = await users
      .find({ email: { $regex: `^\\s*${email.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}\\s*$`, $options: 'i' } })
      .toArray()

    // Compute created time fallback from ObjectId
    const withMeta = fullDocs.map(d => ({
      ...d,
      _emailNorm: normalizeEmail(d.email),
      _hasHash: Boolean(d.passwordHash),
      _time: d.createdAt ? new Date(d.createdAt).getTime() : d._id.getTimestamp().getTime()
    })).filter(d => d._emailNorm === email)

    // Choose keeper
    withMeta.sort((a, b) => {
      // keep hashed first
      if (a._hasHash !== b._hasHash) return a._hasHash ? -1 : 1
      // then oldest
      return a._time - b._time
    })

    const keeper = withMeta[0]
    keptIds.push(keeper._id)

    for (let i = 1; i < withMeta.length; i++) {
      idsToDelete.push(withMeta[i]._id)
    }
  }

  if (idsToDelete.length > 0) {
    const delRes = await users.deleteMany({ _id: { $in: idsToDelete } })
    console.log(`Deleted duplicates: ${delRes.deletedCount}`)
  } else {
    console.log('No duplicate emails found.')
  }

  // 2) Ensure emails are normalized (optional but recommended)
  // This helps avoid future duplicates by casing/spaces.
  // WARNING: this will rewrite emails to lowercase trimmed version.
  const normRes = await users.updateMany(
    { email: { $type: 'string' } },
    [{ $set: { email: { $toLower: { $trim: { input: '$email' } } } } }]
  )
  console.log(`Normalized emails on ${normRes.modifiedCount} users.`)

  // 3) Add passwordHash for users missing it
  const passwordHash = await bcrypt.hash(DEFAULT_PASSWORD, SALT_ROUNDS)
  const passRes = await users.updateMany(
    { passwordHash: { $exists: false } },
    { $set: { passwordHash } }
  )
  console.log(`Added passwordHash to ${passRes.modifiedCount} users.`)

  await client.close()
  console.log('Done.')
}

main().catch((e) => {
  console.error(e)
  process.exit(1)
})
