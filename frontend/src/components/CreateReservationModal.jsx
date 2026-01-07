import { Modal, Button, Form, Row, Col } from 'react-bootstrap'
import { useState, useEffect } from 'react'
import { getStoredUser } from '../api.js'

export default function CreateReservationModal({
  show,
  onClose,
  room,
  onSuccess
}) {
  const [form, setForm] = useState({
    date: '',
    startTime: '',
    endTime: ''
  })
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  useEffect(() => {
    if (show) {
      setForm({ date: new Date().toISOString().split('T')[0], startTime: '', endTime: '' })
      setError('')
    }
  }, [show])

  function updateForm(e) {
    const { name, value } = e.target
    setForm(prev => ({ ...prev, [name]: value }))
  }

  async function handleSubmit() {
    if (!room) return

    setLoading(true)
    setError('')

    try {
      const res = await fetch('/api/reservations', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          roomId: room._id,
          user: getStoredUser()._id,
          ...form
        })
      })

      if (!res.ok) {
        const data = await res.json()
        throw new Error(data.message || 'Failed to create reservation')
      }

      onClose()
      onSuccess?.()
    } catch (err) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }

  return (
    <Modal show={show} onHide={onClose} centered>
      <Modal.Header closeButton>
        <Modal.Title>Reserve Room</Modal.Title>
      </Modal.Header>

      <Modal.Body>
        {room && (
          <>
            <div className="mb-3">
              <strong>{room.name}</strong>
              <div className="text-muted">
                Capacity: {room.capacity}
              </div>
            </div>

            {error && <div className="text-danger mb-2">{error}</div>}

            <Form.Group className="mb-3">
              <Form.Label>Date</Form.Label>
              <Form.Control
                type="date"
                name="date"
                value={form.date}
                onChange={updateForm}
              />
            </Form.Group>

            <Row>
              <Col>
                <Form.Group className="mb-3">
                  <Form.Label>Start Time</Form.Label>
                  <Form.Control
                    type="time"
                    name="startTime"
                    value={form.startTime}
                    onChange={updateForm}
                  />
                </Form.Group>
              </Col>

              <Col>
                <Form.Group className="mb-3">
                  <Form.Label>End Time</Form.Label>
                  <Form.Control
                    type="time"
                    name="endTime"
                    value={form.endTime}
                    onChange={updateForm}
                  />
                </Form.Group>
              </Col>
            </Row>
          </>
        )}
      </Modal.Body>

      <Modal.Footer>
        <Button variant="secondary" onClick={onClose}>
          Cancel
        </Button>
        <Button
          variant="primary"
          onClick={handleSubmit}
          disabled={loading}
        >
          {loading ? 'Saving…' : 'Confirm Reservation'}
        </Button>
      </Modal.Footer>
    </Modal>
  )
}
