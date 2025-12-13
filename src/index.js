/**
 * App entrypoint.
 * We keep the HTTP listener separate from the Express app instance so
 * tests can import `app` without opening a real port.
 */
import app from './app.js'
import { connectToDb } from './db/mongo.js'
import dotenv from 'dotenv'

const envFile =
  process.env.NODE_ENV === 'test'
    ? '.env.test'
    : '.env'

dotenv.config({ path: envFile })

const PORT = process.env.PORT || 3000

async function start () {
  await connectToDb()
  app.listen(PORT, () => {
    console.log(`[server] listening on http://localhost:${PORT}`)
  })
}

start()
