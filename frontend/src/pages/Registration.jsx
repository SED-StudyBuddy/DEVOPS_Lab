import { useState } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import Container from 'react-bootstrap/Container'
import Row from 'react-bootstrap/Row'
import Col from 'react-bootstrap/Col'
import Card from 'react-bootstrap/Card'
import Form from 'react-bootstrap/Form'
import Button from 'react-bootstrap/Button'
import Alert from 'react-bootstrap/Alert'
import { apiFetch } from '../api.js'

export default function RegistrationPage () {
  const navigate = useNavigate()
  const [email, setEmail] = useState('')
  const [fullName, setFullName] = useState('')
  const [school, setSchool] = useState('')
  const [schoolYear, setSchoolYear] = useState('')
  const [major, setMajor] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState(null)
  const [loading, setLoading] = useState(false)

  async function onSubmit (e) {
    e.preventDefault()
    setError(null)
    setLoading(true)

    try {
      await apiFetch('/api/users', {
        method: 'POST',
        body: JSON.stringify({
          email,
          fullName,
          role: 'student',
          school,
          schoolYear: Number(schoolYear),
          major,
          password
        })
      })

      navigate('/login')
    } catch (err) {
      setError(err.message || 'Registration failed')
    } finally {
      setLoading(false)
    }
  }

  return (
    <Container className="py-5">
      <Row className="justify-content-center">
        <Col md={8} lg={6}>
          <Card className="shadow-sm">
            <Card.Body>
              <h2 className="fw-bold text-center mb-4">Create your account</h2>

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

                <Form.Group className="mb-3">
                  <Form.Label>Full Name</Form.Label>
                  <Form.Control
                    type="text"
                    placeholder="John Doe"
                    value={fullName}
                    onChange={(e) => setFullName(e.target.value)}
                    required
                  />
                </Form.Group>

                <Row>
                  <Col md={6}>
                    <Form.Group className="mb-3">
                      <Form.Label>School</Form.Label>
                      <Form.Select value={school} onChange={(e) => setSchool(e.target.value)} required>
                        <option value="">Select school</option>
                        <option value="ESILV">ESILV</option>
                        <option value="EMLV">EMLV</option>
                        <option value="IIM">IIM</option>
                      </Form.Select>
                    </Form.Group>
                  </Col>

                  <Col md={6}>
                    <Form.Group className="mb-3">
                      <Form.Label>School Year</Form.Label>
                      <Form.Select value={schoolYear} onChange={(e) => setSchoolYear(e.target.value)} required>
                        <option value="">Select year</option>
                        <option value="1">Year 1</option>
                        <option value="2">Year 2</option>
                        <option value="3">Year 3</option>
                        <option value="4">Year 4</option>
                        <option value="5">Year 5</option>
                      </Form.Select>
                    </Form.Group>
                  </Col>
                </Row>

                <Form.Group className="mb-3">
                  <Form.Label>Major</Form.Label>
                  <Form.Control
                    type="text"
                    placeholder="Computer Science, Finance, Design..."
                    value={major}
                    onChange={(e) => setMajor(e.target.value)}
                    required
                  />
                </Form.Group>

                <Form.Group className="mb-4">
                  <Form.Label>Password</Form.Label>
                  <Form.Control
                    type="password"
                    placeholder="Choose a strong password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    required
                  />
                </Form.Group>

                <Button type="submit" variant="primary" className="w-100" disabled={loading}>
                  {loading ? 'Creating…' : 'Register'}
                </Button>

                <div className="text-center mt-3">
                  <small className="text-muted">
                    Already have an account? <Link to="/login">Login</Link>
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
