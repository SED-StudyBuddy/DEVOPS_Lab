import { useEffect, useState } from 'react'
import Container from 'react-bootstrap/Container'
import Card from 'react-bootstrap/Card'
import Alert from 'react-bootstrap/Alert'
import Spinner from 'react-bootstrap/Spinner'
import { apiFetch, getStoredUser, setAuth, clearAuth } from '../api'

export default function ProfilePage () {
  const [user, setUser] = useState(() => getStoredUser())
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  useEffect(() => {
    let cancelled = false

    async function load () {
      setLoading(true)
      setError(null)
      try {
        const me = await apiFetch('/api/auth/me')
        if (cancelled) return
        setUser(me)

        // On resynchronise le user en localStorage (sans toucher au token)
        const token = localStorage.getItem('token')
        if (token) setAuth({ token, user: me })
      } catch (err) {
        // Token invalide ou expiré
        clearAuth()
        if (!cancelled) setError(err.message || 'Not authenticated')
      } finally {
        if (!cancelled) setLoading(false)
      }
    }

    load()
    return () => { cancelled = true }
  }, [])

  return (
    <Container className="py-4" style={{ maxWidth: 720 }}>
      <h1 className="mb-4 text-center">Profile</h1>

      {loading && (
        <div className="d-flex justify-content-center">
          <Spinner />
        </div>
      )}

      {!loading && error && (
        <Alert variant="danger">{error}</Alert>
      )}

      {!loading && user && (
        <Card className="shadow-sm">
          <Card.Body>
            <div><strong>Name:</strong> {user.fullName}</div>
            <div><strong>Email:</strong> {user.email}</div>
            <div><strong>Role:</strong> {user.role}</div>
            <div><strong>School:</strong> {user.school || '-'}</div>
            <div><strong>Year:</strong> {user.schoolYear ?? '-'}</div>
            <div><strong>Major:</strong> {user.major || '-'}</div>
          </Card.Body>
        </Card>
      )}
    </Container>
  )
}
