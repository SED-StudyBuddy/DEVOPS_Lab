import { useEffect, useState } from 'react'
import Modal from 'react-bootstrap/Modal'
import Button from 'react-bootstrap/Button'
import Form from 'react-bootstrap/Form'
import Row from 'react-bootstrap/Row'
import Col from 'react-bootstrap/Col'

export default function UserModal ({ show, user, onClose, onSave }) {
  const isEdit = Boolean(user?._id)

  const [form, setForm] = useState({
    fullName: '',
    email: '',
    role: 'student',
    school: '',
    schoolYear: '',
    major: '',
    password: ''
  })

  useEffect(() => {
    if (!show) return

    if (user) {
      setForm({
        fullName: user.fullName ?? '',
        email: user.email ?? '',
        role: user.role ?? 'student',
        school: user.school ?? '',
        schoolYear: user.schoolYear ?? '',
        major: user.major ?? '',
        password: '' // empty by default (optional on edit)
      })
    } else {
      setForm({
        fullName: '',
        email: '',
        role: 'student',
        school: '',
        schoolYear: '',
        major: '',
        password: ''
      })
    }
  }, [show, user])

  const handleChange = (e) => {
    const { name, value } = e.target
    setForm(prev => ({ ...prev, [name]: value }))
  }

  const handleSubmit = () => {
    onSave({
      ...(user || {}),
      ...form
    })
  }

  return (
    <Modal show={show} onHide={onClose}>
      <Modal.Header closeButton>
        <Modal.Title>{isEdit ? 'Edit User' : 'Add New User'}</Modal.Title>
      </Modal.Header>

      <Modal.Body>
        <Form>
          <Form.Group className="mb-2">
            <Form.Label>Full Name</Form.Label>
            <Form.Control
              name="fullName"
              value={form.fullName}
              onChange={handleChange}
              placeholder="John Doe"
            />
          </Form.Group>

          <Form.Group className="mb-2">
            <Form.Label>Email</Form.Label>
            <Form.Control
              name="email"
              type="email"
              value={form.email}
              onChange={handleChange}
              placeholder="name@example.com"
            />
          </Form.Group>

          <Row>
            <Col md={6}>
              <Form.Group className="mb-2">
                <Form.Label>Role</Form.Label>
                <Form.Select
                  name="role"
                  value={form.role}
                  onChange={handleChange}
                >
                  <option value="student">student</option>
                  <option value="admin">admin</option>
                </Form.Select>
              </Form.Group>
            </Col>

            <Col md={6}>
              <Form.Group className="mb-2">
                <Form.Label>School Year</Form.Label>
                <Form.Select
                  name="schoolYear"
                  value={String(form.schoolYear)}
                  onChange={handleChange}
                >
                  <option value="">(none)</option>
                  <option value="1">1</option>
                  <option value="2">2</option>
                  <option value="3">3</option>
                  <option value="4">4</option>
                  <option value="5">5</option>
                </Form.Select>
              </Form.Group>
            </Col>
          </Row>

          <Row>
            <Col md={6}>
              <Form.Group className="mb-2">
                <Form.Label>School</Form.Label>
                <Form.Select
                  name="school"
                  value={form.school}
                  onChange={handleChange}
                >
                  <option value="">(none)</option>
                  <option value="ESILV">ESILV</option>
                  <option value="EMLV">EMLV</option>
                  <option value="IIM">IIM</option>
                </Form.Select>
              </Form.Group>
            </Col>

            <Col md={6}>
              <Form.Group className="mb-2">
                <Form.Label>Major</Form.Label>
                <Form.Control
                  name="major"
                  value={form.major}
                  onChange={handleChange}
                  placeholder="DIA, OCC..."
                />
              </Form.Group>
            </Col>
          </Row>

          <Form.Group className="mb-2">
            <Form.Label>
              Password {isEdit ? '(leave empty to keep current)' : ''}
            </Form.Label>
            <Form.Control
              name="password"
              type="password"
              value={form.password}
              onChange={handleChange}
              placeholder={isEdit ? 'New password (optional)' : 'Password (required)'}
            />
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
