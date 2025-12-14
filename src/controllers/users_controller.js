import { connectToDb } from '../db/mongo.js'
import * as usersCollection from '../db/users_collection.js'

export async function getUsers (_req, res, next) {
  try {
    await connectToDb()
    const users = await usersCollection.getUsers()
    res.status(200).json(users)
  } catch (err) {
    next(err)
  }
}

export async function getUserById (_req, res, next) {
  try {
    await connectToDb()
    const user = await usersCollection.getUserById(_req.params.userId)

    if (!user) {
      return res.status(404).json({ message: 'User not found' })
    }

    res.status(200).json(user)
  } catch (err) {
    next(err)
  }
}

export async function createUser (_req, res, next) {
  try {
    await connectToDb()
    const data = _req.body

    if (!data.fullName || !data.email || !data.role) {
      return res.status(400).json({ message: 'Missing required fields' })
    }

    if (typeof data.fullName !== 'string' || typeof data.email !== 'string' || typeof data.role !== 'string') {
      return res.status(400).json({ message: 'Invalid data types' })
    }

    const existing = await usersCollection.getUserByEmail(data.email)
    if (existing) {
      return res.status(409).json({ message: 'User with this email already exists' })
    }

    const newUser = {
      fullName: data.fullName,
      email: data.email,
      role: data.role,
      school: data.school || null,
      schoolYear: data.schoolYear || null,
      major: data.major || null
    }

    const created = await usersCollection.createUser(newUser)
    res.status(201).json(created)
  } catch (err) {
    next(err)
  }
}

export async function updateUser (_req, res, next) {
  try {
    await connectToDb()
    const data = _req.body
    const id = _req.params.userId

    const user = await usersCollection.getUserById(id)
    if (!user) {
      return res.status(404).json({ message: 'User not found' })
    }

    if (data.fullName && typeof data.fullName !== 'string') {
      return res.status(400).json({ message: 'Invalid fullName type' })
    }

    if (data.email && typeof data.email !== 'string') {
      return res.status(400).json({ message: 'Invalid email type' })
    }

    if (data.role && typeof data.role !== 'string') {
      return res.status(400).json({ message: 'Invalid role type' })
    }

    if (data.email) {
      const existing = await usersCollection.getUserByEmail(data.email)
      if (existing && String(existing._id) !== String(user._id)) {
        return res.status(409).json({ message: 'User with this email already exists' })
      }
    }

    const updated = await usersCollection.updateUser(id, data)
    res.status(200).json(updated)
  } catch (err) {
    next(err)
  }
}

export async function deleteUser (_req, res, next) {
  try {
    await connectToDb()
    const user = await usersCollection.getUserById(_req.params.userId)

    if (!user) {
      return res.status(404).json({ message: 'User not found' })
    }

    await usersCollection.deleteUser(_req.params.userId)
    res.status(200).json({ message: 'User deleted successfully' })
  } catch (err) {
    next(err)
  }
}
