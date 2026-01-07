import { useState } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import Container from 'react-bootstrap/Container'
import Row from 'react-bootstrap/Row'
import Col from 'react-bootstrap/Col'
import Card from 'react-bootstrap/Card'
import Form from 'react-bootstrap/Form'
import Button from 'react-bootstrap/Button'
import Alert from 'react-bootstrap/Alert'
import { apiFetch, setAuth } from '../api'

export default function LoginPage () {
  const navigate = useNavigate()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState(null)
  const [loading, setLoading] = useState(false)

  async function onSubmit (e) {
    e.preventDefault()
    setError(null)
    setLoading(true)

    try {
      const result = await apiFetch('/api/auth/login', {
        method: 'POST',
        body: JSON.stringify({ email, password })
      })

      setAuth(result)

      const role = result?.user?.role
      navigate(role === 'admin' ? '/admin' : '/profile')
    } catch (err) {
      setError(err.message || 'Login failed')
    } finally {
      setLoading(false)
    }
  }

  return (
    <Container className="py-5">
      <Row className="justify-content-center">
        <Col md={6} lg={4}>
          <Card className="shadow-sm">
            <Card.Body>
              <h2 className="fw-bold text-center mb-4">Welcome back</h2>

              {error && <Alert variant="danger">{error}</Alert>}

              <Form onSubmit={onSubmit}>
                <Form.Group className="mb-3">
                  <Form.Label>Student Email</Form.Label>
                  <Form.Control
                    type="email"
                    placeholder="name@student.school.edu"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                  />
                </Form.Group>

                <Form.Group className="mb-4">
                  <Form.Label>Password</Form.Label>
                  <Form.Control
                    type="password"
                    placeholder="Enter your password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    required
                  />
                </Form.Group>

                <Button type="submit" variant="primary" className="w-100" disabled={loading}>
                  {loading ? 'Logging in…' : 'Login'}
                </Button>

                <div className="text-center mt-3">
                  <small className="text-muted">
                    Don’t have an account? <Link to="/register">Register</Link>
                  </small>
                </div>
              </Form>
            </Card.Body>
          </Card>
        </Col>
      </Row>
    </Container>
  )
}
