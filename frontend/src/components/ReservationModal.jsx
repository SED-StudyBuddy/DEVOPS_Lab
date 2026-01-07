import { useState } from 'react'
import { Modal, Button, Form } from 'react-bootstrap'
import { getStoredUser } from '../api.js'

export default function ReservationModal({
  show,
  onClose,
  onSave,
  reservation,
  rooms,
  users
}) {
  const [form, setForm] = useState(() =>
    reservation
      ? {
          roomId: reservation.roomId,
          user: reservation.user,
          date: reservation.date,
          startTime: reservation.startTime,
          endTime: reservation.endTime,
          status: reservation.status
        }
      : {
    roomId: '',
    user: '',
    date: '',
    startTime: '',
    endTime: '',
    status: ''
  }
  )

  const handleChange = e => {
    const { name, value } = e.target
    setForm(prev => ({ ...prev, [name]: value }))
  }

  const handleSubmit = () => {
    onSave({
      ...reservation,
      ...form
    })
  }

  return (
    <Modal show={show} onHide={onClose}>
      <Modal.Header closeButton>
        <Modal.Title>
          Edit Reservation
        </Modal.Title>
      </Modal.Header>

      <Modal.Body>
        <Form>

          {getStoredUser().role === 'admin' && (
          <Form.Group className="mb-2">
            <Form.Label>User</Form.Label>
            <Form.Select
              name="user"
              value={form.user}
              onChange={handleChange}
            >
              <option value="">Select a user</option>
              {users.map(user => (
                <option key={user._id} value={user._id}>
                  {user.fullName}
                </option>
              ))}
            </Form.Select>
          </Form.Group>

          )}

          <Form.Group className="mb-2">
            <Form.Label>Room</Form.Label>
            <Form.Select
              name="roomId"
              value={form.roomId}
              onChange={handleChange}
            >
              <option value="">Select room</option>
              {rooms.map(room => (
                <option key={room._id} value={room._id}>
                  {room.name}
                </option>
              ))}
            </Form.Select>
          </Form.Group>

          <Form.Group className="mb-2">
            <Form.Label>Date</Form.Label>
            <Form.Control
              type="date"
              name="date"
              value={form.date}
              onChange={handleChange}
            />
          </Form.Group>

          <Form.Group className="mb-2">
            <Form.Label>Start time</Form.Label>
            <Form.Control
              type="time"
              name="startTime"
              value={form.startTime}
              onChange={handleChange}
            />
          </Form.Group>

          <Form.Group className="mb-2">
            <Form.Label>End time</Form.Label>
            <Form.Control
              type="time"
              name="endTime"
              value={form.endTime}
              onChange={handleChange}
            />
          </Form.Group>
          <Form.Group className="mb-2">
            <Form.Label>Status</Form.Label>
            <Form.Select
              name="status"
              value={form.status}
              onChange={handleChange}
            >
              <option value="Scheduled">Scheduled</option>
              <option value="Cancelled">Cancelled</option>
              <option value="Completed">Completed</option>
            </Form.Select>
          </Form.Group>
        </Form>
      </Modal.Body>

      <Modal.Footer>
        <Button variant="secondary" onClick={onClose}>
          Cancel
        </Button>
        <Button variant="primary" onClick={handleSubmit}>
          Save
        </Button>
      </Modal.Footer>
    </Modal>
  )
}
