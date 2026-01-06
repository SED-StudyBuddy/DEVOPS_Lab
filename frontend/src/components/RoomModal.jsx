import { useState } from 'react'
import Modal from 'react-bootstrap/Modal'
import Button from 'react-bootstrap/Button'
import Form from 'react-bootstrap/Form'

export default function RoomModal({ show, room, onClose, onSave }) {
  const [form, setForm] = useState({
  ...room,
  equipment: room?.equipment.join(', ')
})


  if (!form) return null

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target
    setForm(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }))
  }

  const handleSubmit = () => {
    onSave({
      ...form,
      capacity: Number(form.capacity),
      equipment: form.equipment.split(',').map(e => e.trim()),
      available: Boolean(form.available)
    })
  }

  return (
    <Modal show={show} onHide={onClose}>
      <Modal.Header closeButton>
        <Modal.Title>{room != null ? 'Edit Room' : 'Add New Room'}</Modal.Title>
      </Modal.Header>

      <Modal.Body>
        <Form>
          <Form.Group className="mb-2">
            <Form.Label>Name</Form.Label>
            <Form.Control
              name="name"
              value={form.name}
              onChange={handleChange}
            />
          </Form.Group>

          <Form.Group className="mb-2">
            <Form.Label>Capacity</Form.Label>
            <Form.Control
              type="number"
              name="capacity"
              value={form.capacity}
              onChange={handleChange}
            />
          </Form.Group>

          <Form.Group className="mb-2">
            <Form.Label>Equipment</Form.Label>
            <Form.Control
              name="equipment"
              value={form.equipment}
              onChange={handleChange}
            />
          </Form.Group>

          <Form.Check
            type="checkbox"
            label="Available"
            name="available"
            checked={form.available}
            onChange={handleChange}
          />
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
