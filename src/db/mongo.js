const { MongoClient } = require('mongodb')

const username = encodeURIComponent('projectdb_user')
const password = encodeURIComponent('password1231')

const uri =
  `mongodb+srv://${username}:${password}@$software-engineering-pr.uplzszf.mongodb.net/?appName=software-engineering-project`

const client = new MongoClient(uri)

async function run () {
  try {
    await client.connect()

    const database = client.db('studybuddydb')
    const studyrooms = database.collection('studyrooms')

    const cursor = studyrooms.find()

    await cursor.forEach(doc => console.dir(doc))
  } finally {
    await client.close()
  }
}
run().catch(console.dir)
