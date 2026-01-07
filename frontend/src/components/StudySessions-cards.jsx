import { Card, Row, Col, Button } from 'react-bootstrap'

export default function SessionCards({ sessions, onEdit, onCancel, onLeave }) {
  return (
    <Row className="g-3">
      {sessions.map(s => (
        <Col md={6} lg={4} key={s._id}>
          <Card className="h-100 shadow-sm">
            <Card.Body>
              <Card.Title>{s.name}</Card.Title>
              <Card.Text>
                <strong>Date:</strong> {s.date}<br />
                <strong>Time:</strong> {s.startTime} – {s.endTime}<br />
                <strong>Room:</strong> {s.roomName ?? 'Virtual'}
              </Card.Text>
            </Card.Body>

            <Card.Footer className="d-flex justify-content-between">
              {onEdit && (
                <Button size="sm" onClick={() => onEdit(s._id)}>
                  Edit
                </Button>
              )}
              {onLeave && (
                <Button
                  size="sm"
                  variant="warning"
                  onClick={() => onLeave(s._id)}
                >
                  Leave
                </Button>
              )}
              {onCancel && (
                <Button
                  size="sm"
                  variant="danger"
                  onClick={() => onCancel(s._id)}
                >
                  Cancel
                </Button>
              )}
            </Card.Footer>
          </Card>
        </Col>
      ))}
    </Row>
  )
}
