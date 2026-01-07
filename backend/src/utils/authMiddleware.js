import jwt from 'jsonwebtoken'
import { DomainError } from '../errors/DomainError.js'

const JWT_SECRET = process.env.JWT_SECRET || 'dev-secret-change-me'

export function requireAuth (req, _res, next) {
  const auth = req.headers.authorization
  if (!auth?.startsWith('Bearer ')) return next(new DomainError('UNAUTHORIZED', 'Missing token'))

  const token = auth.slice('Bearer '.length)
  try {
    req.user = jwt.verify(token, JWT_SECRET)
    next()
  } catch {
    next(new DomainError('UNAUTHORIZED', 'Invalid token'))
  }
}

export function requireAdmin (req, _res, next) {
  if (req.user?.role !== 'admin') {
    return next(new DomainError('FORBIDDEN', 'Admin only'))
  }
  next()
}
