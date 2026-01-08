import { useEffect, useMemo, useState } from 'react'
import Table from 'react-bootstrap/Table'
import Button from 'react-bootstrap/Button'
import Form from 'react-bootstrap/Form'
import Col from 'react-bootstrap/Col'
import FloatingLabel from 'react-bootstrap/FloatingLabel'
import UserModal from './UserModal'
import { apiFetch } from '../api.js'

export default function UsersTable () {
  const [users, setUsers] = useState([])
  const [showModal, setShowModal] = useState(false)
  const [selectedUser, setSelectedUser] = useState(null)

  const [search, setSearch] = useState('')
  const [roleFilter, setRoleFilter] = useState('all')

  useEffect(() => {
    const controller = new AbortController()

    const fetchUsers = async () => {
      try {
        const data = await apiFetch('/api/users', { signal: controller.signal })
        setUsers(Array.isArray(data) ? data : [])
      } catch (err) {
        if (err.name !== 'AbortError') console.error(err)
      }
    }

    fetchUsers()
    return () => controller.abort()
  }, [])

  const filteredUsers = useMemo(() => {
    const q = search.trim().toLowerCase()

    return users.filter(u => {
      const matchesSearch =
        !q ||
        (u.fullName || '').toLowerCase().includes(q) ||
        (u.email || '').toLowerCase().includes(q)

      const matchesRole =
        roleFilter === 'all' || (u.role || '').toLowerCase() === roleFilter

      return matchesSearch && matchesRole
    })
  }, [users, search, roleFilter])

  const handleEdit = (user) => {
    setSelectedUser(user)
    setShowModal(true)
  }

  const handleDelete = async (id) => {
    if (!window.confirm('Are you sure?')) return

    await apiFetch(`/api/users/${id}`, { method: 'DELETE' })
    setUsers(prev => prev.filter(u => u._id !== id))
  }

  const handleSave = async (userData) => {
    // Create
    if (!userData._id) {
      const created = await apiFetch('/api/users', {
        method: 'POST',
        body: JSON.stringify({
          fullName: userData.fullName,
          email: userData.email,
          role: userData.role,
          school: userData.school || null,
          schoolYear: userData.schoolYear ? Number(userData.schoolYear) : null,
          major: userData.major || null,
          password: userData.password // required for create
        })
      })

      setUsers(prev => [...prev, created])
      setShowModal(false)
      setSelectedUser(null)
      return
    }

    // Update
    const payload = {
      fullName: userData.fullName,
      email: userData.email,
      role: userData.role,
      school: userData.school || null,
      schoolYear: userData.schoolYear ? Number(userData.schoolYear) : null,
      major: userData.major || null
    }

    // Optional password change
    if (userData.password && userData.password.trim().length > 0) {
      payload.password = userData.password
    }

    const updated = await apiFetch(`/api/users/${userData._id}`, {
      method: 'PUT',
      body: JSON.stringify(payload)
    })

    setUsers(prev => prev.map(u => (u._id === updated._id ? updated : u)))
    setShowModal(false)
    setSelectedUser(null)
  }

  return (
    <>
      <div className="d-flex gap-2 mb-3 px-5">
        <Col>
          <Form.Control
            className="h-100"
            type="text"
            placeholder="Search by name or email"
            value={search}
            onChange={e => setSearch(e.target.value)}
          />
        </Col>

        <Col>
          <FloatingLabel controlId="roleFilter" label="Filter by Role">
            <Form.Select
              aria-label="Filter by role"
              value={roleFilter}
              onChange={e => setRoleFilter(e.target.value)}
            >
              <option value="all">All</option>
              <option value="student">Student</option>
              <option value="admin">Admin</option>
            </Form.Select>
          </FloatingLabel>
        </Col>
      </div>

      <div className="text-end">
        <Button
          variant="success"
          className="m-2"
          onClick={() => {
            setSelectedUser(null)
            setShowModal(true)
          }}
        >
          Add New User
        </Button>
      </div>

      <Table striped bordered hover>
        <thead>
          <tr>
            <th>Id</th>
            <th>Full Name</th>
            <th>Email</th>
            <th>Role</th>
            <th>School</th>
            <th>Year</th>
            <th>Major</th>
            <th>Action</th>
          </tr>
        </thead>

        <tbody>
          {filteredUsers.map(u => (
            <tr key={u._id}>
              <td>{u._id}</td>
              <td>{u.fullName}</td>
              <td>{u.email}</td>
              <td>{u.role}</td>
              <td>{u.school ?? '-'}</td>
              <td>{u.schoolYear ?? '-'}</td>
              <td>{u.major ?? '-'}</td>
              <td>
                <Button
                  size="sm"
                  variant="primary"
                  className="me-2"
                  onClick={() => handleEdit(u)}
                >
                  Edit
                </Button>

                <Button
                  size="sm"
                  variant="danger"
                  onClick={() => handleDelete(u._id)}
                >
                  Delete
                </Button>
              </td>
            </tr>
          ))}
        </tbody>
      </Table>

      <UserModal
        key={selectedUser?._id ?? 'new'}
        show={showModal}
        user={selectedUser}
        onClose={() => {
          setShowModal(false)
          setSelectedUser(null)
        }}
        onSave={handleSave}
      />
    </>
  )
}
