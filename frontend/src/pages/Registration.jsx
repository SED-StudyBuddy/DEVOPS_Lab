import Container from 'react-bootstrap/Container'
import Row from 'react-bootstrap/Row'
import Col from 'react-bootstrap/Col'
import Card from 'react-bootstrap/Card'
import Form from 'react-bootstrap/Form'
import Button from 'react-bootstrap/Button'

export default function RegistrationPage() {
  return (
    <Container className="py-5">
      <Row className="justify-content-center">
        <Col md={8} lg={6}>
          <Card className="shadow-sm">
            <Card.Body>
              <h2 className="fw-bold text-center mb-4">Create your account</h2>

              <Form>
                <Form.Group className="mb-3">
                  <Form.Label>Student Email</Form.Label>
                  <Form.Control
                    type="email"
                    placeholder="name@student.school.edu"
                    required
                  />
                </Form.Group>

                <Form.Group className="mb-3">
                  <Form.Label>Full Name</Form.Label>
                  <Form.Control
                    type="text"
                    placeholder="John Doe"
                    required
                  />
                </Form.Group>

                <Form.Group className="mb-3">
                  <Form.Label>Student Number</Form.Label>
                  <Form.Control
                    type="text"
                    placeholder="12345678"
                    required
                  />
                </Form.Group>

                <Row>
                  <Col md={6}>
                    <Form.Group className="mb-3">
                      <Form.Label>School</Form.Label>
                      <Form.Select required>
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
                      <Form.Select required>
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
                    required
                  />
                </Form.Group>

                <Form.Group className="mb-4">
                  <Form.Label>Password</Form.Label>
                  <Form.Control
                    type="password"
                    placeholder="Choose a strong password"
                    required
                  />
                </Form.Group>

                <Button type="submit" variant="primary" className="w-100">
                  Register
                </Button>

                <div className="text-center mt-3">
                  <small className="text-muted">
                    Already have an account? <a href="/login">Login</a>
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
