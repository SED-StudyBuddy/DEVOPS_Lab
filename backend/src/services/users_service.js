import * as usersCollection from '../db/users_collection.js'
import { DomainError } from '../errors/DomainError.js'
import { ObjectId } from 'mongodb'

export async function getUsers () {
  return usersCollection.getUsers()
}

export async function getUserById (id) {
  if (!ObjectId.isValid(id)) {
    throw new DomainError('INVALID_USER', 'Invalid userId format')
  }

  const user = await usersCollection.getUserById(id)
  if (!user) {
    throw new DomainError('USER_NOT_FOUND', 'User not found')
  }

  return user
}

export async function createUser (data) {
  validateUser(data)

  const existing = await usersCollection.getUserByEmail(data.email)
  if (existing) {
    throw new DomainError('EMAIL_CONFLICT', 'User with this email already exists')
  }

  return usersCollection.createUser(data)
}

export async function updateUser (id, updates) {
  if (!ObjectId.isValid(id)) {
    throw new DomainError('INVALID_USER', 'Invalid userId format')
  }

  const existingUser = await usersCollection.getUserById(id)
  if (!existingUser) {
    throw new DomainError('USER_NOT_FOUND', 'User not found')
  }

  const merged = {
    ...existingUser,
    ...updates
  }

  validateUser(merged, { partial: true })

  if (updates.email) {
    const existing = await usersCollection.getUserByEmail(updates.email)
    if (existing && String(existing._id) !== String(existingUser._id)) {
      throw new DomainError('EMAIL_CONFLICT', 'User with this email already exists')
    }
  }

  return usersCollection.updateUser(id, updates)
}

export async function deleteUser (id) {
  if (!ObjectId.isValid(id)) {
    throw new DomainError('INVALID_USER', 'Invalid userId format')
  }

  const user = await usersCollection.getUserById(id)
  if (!user) {
    throw new DomainError('USER_NOT_FOUND', 'User not found')
  }

  await usersCollection.deleteUser(id)
}

function validateUser (data, { partial = false } = {}) {
  const { fullName, email, role, schoolYear } = data

  if (!partial) {
    if (!fullName || !email || !role) {
      throw new DomainError('INVALID_INPUT', 'Missing required fields')
    }
  }

  if (fullName && typeof fullName !== 'string') {
    throw new DomainError('INVALID_INPUT', 'Invalid fullName type')
  }

  if (email && typeof email !== 'string') {
    throw new DomainError('INVALID_INPUT', 'Invalid email type')
  }

  if (role && typeof role !== 'string') {
    throw new DomainError('INVALID_INPUT', 'Invalid role type')
  }

  if (schoolYear && typeof schoolYear !== 'number') {
    throw new DomainError('INVALID_INPUT', 'Invalid schoolYear type')
  }

  if (email && !email.includes('@')) {
    throw new DomainError('INVALID_INPUT', 'Invalid email format')
  }
}
