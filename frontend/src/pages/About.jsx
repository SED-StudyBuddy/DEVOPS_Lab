import Container from 'react-bootstrap/Container'
import Row from 'react-bootstrap/Row'
import Col from 'react-bootstrap/Col'
import Card from 'react-bootstrap/Card'

export default function AboutPage() {
  return (
    <Container className="py-5">
      <Row className="mb-5">
        <Col>
          <h1 className="fw-bold">About StudyBuddy</h1>
          <p className="lead text-muted mt-3">
            StudyBuddy is a collaborative study management platform designed to
            simplify room reservations, study group creation, and both physical
            and virtual collaboration.
          </p>
          <p>created by Andi Rodríguez Macuacé, Gabin Salon and Paul Plantier</p>
        </Col>
      </Row>

      <Row className="g-4 mb-5">
        <Col md={6}>
          <Card className="h-100 shadow-sm">
            <Card.Body>
              <Card.Title>🎯 Our Mission</Card.Title>
              <Card.Text>
                Our mission is to improve the student learning experience by
                reducing scheduling conflicts, improving space utilization, and
                making collaboration easier and more accessible.
              </Card.Text>
            </Card.Body>
          </Card>
        </Col>

        <Col md={6}>
          <Card className="h-100 shadow-sm">
            <Card.Body>
              <Card.Title>📈 Our Goals</Card.Title>
              <Card.Text as="div">
                <ul className="mb-0">
                  <li>Enhance student engagement</li>
                  <li>Optimize study space usage</li>
                  <li>Support collaborative learning</li>
                  <li>Reduce administrative workload</li>
                </ul>
              </Card.Text>
            </Card.Body>
          </Card>
        </Col>
      </Row>

      <Row className="g-4">
        <Col md={4}>
          <Card className="h-100 shadow-sm">
            <Card.Body>
              <Card.Title>🎓 For Students</Card.Title>
              <Card.Text>
                Find rooms, create study sessions, join groups, and collaborate
                in-person or online with ease.
              </Card.Text>
            </Card.Body>
          </Card>
        </Col>

        <Col md={4}>
          <Card className="h-100 shadow-sm">
            <Card.Body>
              <Card.Title>🏫 For Administrators</Card.Title>
              <Card.Text>
                Manage bookings, monitor availability, and gain insight into
                space usage and scheduling patterns.
              </Card.Text>
            </Card.Body>
          </Card>
        </Col>

        <Col md={4}>
          <Card className="h-100 shadow-sm">
            <Card.Body>
              <Card.Title>⚙️ For Institutions</Card.Title>
              <Card.Text>
                Improve resource utilization and support modern, flexible
                learning environments.
              </Card.Text>
            </Card.Body>
          </Card>
        </Col>
      </Row>
    </Container>
  )
}
