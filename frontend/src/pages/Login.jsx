import Container from 'react-bootstrap/Container'
import Row from 'react-bootstrap/Row'
import Col from 'react-bootstrap/Col'
import Card from 'react-bootstrap/Card'
import Form from 'react-bootstrap/Form'
import Button from 'react-bootstrap/Button'

export default function LoginPage() {
  return (
    <Container className="py-5">
      <Row className="justify-content-center">
        <Col md={6} lg={4}>
          <Card className="shadow-sm">
            <Card.Body>
              <h2 className="fw-bold text-center mb-4">Welcome back</h2>

              <Form>
                <Form.Group className="mb-3">
                  <Form.Label>Student Email</Form.Label>
                  <Form.Control
                    type="email"
                    placeholder="name@student.school.edu"
                    required
                  />
                </Form.Group>

                <Form.Group className="mb-4">
                  <Form.Label>Password</Form.Label>
                  <Form.Control
                    type="password"
                    placeholder="Enter your password"
                    required
                  />
                </Form.Group>

                <Button type="submit" variant="primary" className="w-100">
                  Login
                </Button>

                <div className="text-center mt-3">
                  <small className="text-muted">
                    Don’t have an account? <a href="/register">Register</a>
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
