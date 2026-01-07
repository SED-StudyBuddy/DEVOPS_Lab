import { connectToDb } from '../db/mongo.js'
import * as authService from '../services/auth_service.js'

export async function login (_req, res, next) {
  try {
    await connectToDb()
    const result = await authService.login(_req.body)
    res.status(200).json(result)
  } catch (err) {
    next(err)
  }
}

export async function me (_req, res, next) {
  try {
    await connectToDb()
    const user = await authService.me(_req)
    res.status(200).json(user)
  } catch (err) {
    next(err)
  }
}
