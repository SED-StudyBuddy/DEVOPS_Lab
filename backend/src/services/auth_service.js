import jwt from 'jsonwebtoken'
import bcrypt from 'bcrypt'
import * as usersCollection from '../db/users_collection.js'
import { DomainError } from '../errors/DomainError.js'

const JWT_SECRET = process.env.JWT_SECRET || 'dev-secret-change-me'

function sanitizeUser (u) {
  const { passwordHash, ...rest } = u
  return rest
}

export async function login ({ email, password }) {
  if (!email || !password) {
    throw new DomainError('INVALID_INPUT', 'Email and password are required')
  }

  const user = await usersCollection.getUserByEmail(email)
  if (!user) throw new DomainError('UNAUTHORIZED', 'Invalid credentials')

  const ok = await bcrypt.compare(password, user.passwordHash || '')
  if (!ok) throw new DomainError('UNAUTHORIZED', 'Invalid credentials')

  const token = jwt.sign(
    { sub: String(user._id), role: user.role },
    JWT_SECRET,
    { expiresIn: '2h' }
  )

  return { token, user: sanitizeUser(user) }
}

export async function me (req) {
  const auth = req.headers.authorization
  if (!auth?.startsWith('Bearer ')) {
    throw new DomainError('UNAUTHORIZED', 'Missing token')
  }

  const token = auth.slice('Bearer '.length)
  let payload
  try {
    payload = jwt.verify(token, JWT_SECRET)
  } catch {
    throw new DomainError('UNAUTHORIZED', 'Invalid token')
  }

  const user = await usersCollection.getUserById(payload.sub)
  if (!user) throw new DomainError('UNAUTHORIZED', 'User not found')

  return sanitizeUser(user)
}
