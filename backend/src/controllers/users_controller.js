import { connectToDb } from '../db/mongo.js'
import * as usersService from '../services/users_service.js'

export async function getUsers (_req, res, next) {
  try {
    await connectToDb()
    const users = await usersService.getUsers()
    res.status(200).json(users)
  } catch (err) {
    next(err)
  }
}

export async function getUserById (_req, res, next) {
  try {
    await connectToDb()
    const user = await usersService.getUserById(_req.params.userId)
    res.status(200).json(user)
  } catch (err) {
    next(err)
  }
}

export async function createUser (_req, res, next) {
  try {
    await connectToDb()
    const created = await usersService.createUser(_req.body)
    res.status(201).json(created)
  } catch (err) {
    next(err)
  }
}

export async function updateUser (_req, res, next) {
  try {
    await connectToDb()
    const updated = await usersService.updateUser(_req.params.userId, _req.body)
    res.status(200).json(updated)
  } catch (err) {
    next(err)
  }
}

export async function deleteUser (_req, res, next) {
  try {
    await connectToDb()
    await usersService.deleteUser(_req.params.userId)
    res.status(200).json({ message: 'User deleted successfully' })
  } catch (err) {
    next(err)
  }
}