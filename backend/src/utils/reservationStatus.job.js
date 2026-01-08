import cron from 'node-cron'
import { getDb } from '../db/mongo.js'

function getStart (date, startTime) {
  const [h, m] = startTime.split(':').map(Number)
  const dt = new Date(date)
  dt.setHours(h, m, 0, 0)
  return dt
}

cron.schedule('*/30 * * * *', async () => {
  console.log('Running reservation status job...')
  const now = new Date()

  const db = await getDb()
  const reservationsCollection = db.collection('reservations')

  const reservations = await reservationsCollection
    .find({ status: 'Scheduled' })
    .toArray()

  for (const r of reservations) {
    const start = getStart(r.date, r.startTime)

    if (start < now) {
      await reservationsCollection.updateOne(
        { _id: r._id },
        { $set: { status: 'Completed' } }
      )
    }
  }
})
