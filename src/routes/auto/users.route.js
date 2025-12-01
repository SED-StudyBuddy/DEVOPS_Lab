import { Router } from 'express'

const router = Router()

// In-memory users
let users = [
  {
    id: 1,
    fullName: 'Alice Martin',
    email: 'alice.martin@example.com',
    role: 'student',
    school: 'ESILV',
    schoolYear: 3,
    major: 'DIA'
  },
  {
    id: 2,
    fullName: 'John Doe',
    email: 'john.doe@example.com',
    role: 'admin',
    school: 'ESILV',
    schoolYear: 5,
    major: 'OCC'
  }
]

// GET /api/users → list all users
router.get('/api/users', (_req, res) => {
  res.status(200).json(users)
})

// GET /api/users/:id → get one user
router.get('/api/users/:id', (_req, res) => {
  const id = parseInt(_req.params.id)
  const user = users.find(u => u.id === id)

  if (!user) {
    return res.status(404).json({ message: 'User not found' })
  }

  res.status(200).json(user)
})

// POST /api/users → create user
router.post('/api/users', (_req, res) => {
  const data = _req.body

  if (!data.fullName || !data.email || !data.role) {
    return res.status(400).json({ message: 'Missing required fields' })
  }

  if (typeof data.fullName !== 'string' || typeof data.email !== 'string' || typeof data.role !== 'string') {
    return res.status(400).json({ message: 'Invalid data types' })
  }

  const newUser = {
    id: users.length ? users[users.length - 1].id + 1 : 1,
    fullName: data.fullName,
    email: data.email,
    role: data.role,
    school: data.school || null,
    schoolYear: data.schoolYear || null,
    major: data.major || null
  }

  users.push(newUser)
  res.status(201).json(newUser)
})

// PUT /api/users/:id → update a user
router.put('/api/users/:id', (_req, res) => {
  const id = parseInt(_req.params.id)
  const user = users.find(u => u.id === id)

  if (!user) {
    return res.status(404).json({ message: 'User not found' })
  }

  const data = _req.body

  if (data.fullName && typeof data.fullName !== 'string') {
    return res.status(400).json({ message: 'Invalid fullName type' })
  }

  if (data.email && typeof data.email !== 'string') {
    return res.status(400).json({ message: 'Invalid email type' })
  }

  if (data.role && typeof data.role !== 'string') {
    return res.status(400).json({ message: 'Invalid role type' })
  }

  Object.assign(user, data)

  res.status(200).json(user)
})

// DELETE /api/users/:id → delete user
router.delete('/api/users/:id', (_req, res) => {
  const id = parseInt(_req.params.id)
  const user = users.find(u => u.id === id)

  if (!user) {
    return res.status(404).json({ message: 'User not found' })
  }

  users = users.filter(u => u.id !== id)

  res.status(200).json({ message: 'User deleted successfully' })
})

export default router
