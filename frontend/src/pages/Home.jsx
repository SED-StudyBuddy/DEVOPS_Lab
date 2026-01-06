import Container from 'react-bootstrap/Container'
import Row from 'react-bootstrap/Row'
import Col from 'react-bootstrap/Col'
import Button from 'react-bootstrap/Button'
import Card from 'react-bootstrap/Card'
import { redirect } from 'react-router-dom'

export default function Home() {
  return (
    <>
      <div className="bg-light py-5 border-bottom">
        <Container>
          <Row className="align-items-center">
            <Col md={6}>
              <h1 className="fw-bold mb-3">Study smarter. Together.</h1>
              <p className="lead text-muted">
                StudyBuddy helps students easily find study rooms, form study
                groups, and collaborate, both on campus and online.
              </p>

              <div className="d-flex gap-2 mt-4">
                <Button variant="primary" size="lg" onClick={() => redirect('/rooms')}>
                  Find a Study Room
                </Button>
                <Button variant="outline-primary" size="lg" onClick={() => redirect('/sessions')}>
                  Create a Study Session
                </Button>
              </div>
            </Col>

            <Col md={6} className="text-center mt-4 mt-md-0">
              <img
                src="https://placehold.co/500x300?text=Study+Together"
                alt="Study illustration"
                className="img-fluid rounded shadow-sm"
              />
            </Col>
          </Row>
        </Container>
      </div>

      <Container className="py-5">
        <h2 className="text-center fw-bold mb-5">Why StudyBuddy?</h2>

        <Row className="g-4">
          <Col md={6} lg={3}>
            <Card className="h-100 shadow-sm">
              <Card.Body>
                <Card.Title>🔍 Easy Reservations</Card.Title>
                <Card.Text>
                  Search and book study rooms based on capacity, equipment, and
                  real-time availability.
                </Card.Text>
              </Card.Body>
            </Card>
          </Col>

          <Col md={6} lg={3}>
            <Card className="h-100 shadow-sm">
              <Card.Body>
                <Card.Title>👥 Study Together</Card.Title>
                <Card.Text>
                  Create or join study sessions with students from your course
                  or institution.
                </Card.Text>
              </Card.Body>
            </Card>
          </Col>

          <Col md={6} lg={3}>
            <Card className="h-100 shadow-sm">
              <Card.Body>
                <Card.Title>💻 Hybrid Collaboration</Card.Title>
                <Card.Text>
                  Support for both on-campus meetings and online sessions via
                  video conferencing.
                </Card.Text>
              </Card.Body>
            </Card>
          </Col>

          <Col md={6} lg={3}>
            <Card className="h-100 shadow-sm">
              <Card.Body>
                <Card.Title>🔔 Smart Notifications</Card.Title>
                <Card.Text>
                  Get reminders, confirmations, and updates for your bookings
                  and study sessions.
                </Card.Text>
              </Card.Body>
            </Card>
          </Col>
        </Row>
      </Container>
    </>
  )
}
