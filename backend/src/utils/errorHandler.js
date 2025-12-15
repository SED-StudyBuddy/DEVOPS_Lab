import { DomainError } from '../errors/DomainError.js'
/**
 * Centralized Express error handler.
 * Ensures consistent JSON error shape across the API.
 */
export function errorHandler (err, _req, res, _next) {
  // Domain / business errors
  if (err instanceof DomainError) {
    return res.status(mapDomainErrorToStatus(err.code)).json({
      error: true,
      message: err.message
    })
  }

  // Fallback (unexpected errors)
  const status = err?.status ?? 500
  const message = err?.message ?? 'Internal Server Error'
  res.status(status).json({ error: true, message })
}

function mapDomainErrorToStatus (code) {
  if (!code) return 400

  // Not found
  if (code.endsWith('_NOT_FOUND')) return 404

  // Conflicts
  if (code === 'EMAIL_CONFLICT' || code === 'TIME_CONFLICT') return 409

  // Default business error
  return 400
}
