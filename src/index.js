/**
 * App entrypoint.
 * We keep the HTTP listener separate from the Express app instance so
 * tests can import `app` without opening a real port.
 */
import app from './app.js'
import { connectToDb } from './db/mongo.js'

const PORT = process.env.PORT || 3000

async function start () {
  await connectToDb()
  app.listen(PORT, () => {
    console.log(`[server] listening on http://localhost:${PORT}`)
  })
}

start()
