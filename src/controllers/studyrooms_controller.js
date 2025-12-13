import * as roomsCollection from '../db/studyrooms_collection.js'
import * as reservationsCollection from '../db/reservations_collection.js'

const error = (status, message) => {
  const e = new Error(message)
  e.status = status
  return e
}

export async function getAllRooms (query) {
  const filters = {}

  if (query.minCapacity) {
    const minCapacity = Number(query.minCapacity)
    if (isNaN(minCapacity)) {
      throw error(400, 'Invalid minCapacity')
    }
    filters.capacity = { $gte: minCapacity }
  }

  if (query.available !== undefined) {
    filters.available = query.available === 'true'
  }

  return roomsCollection.getAllRooms(filters)
}

export async function getRoomById (roomId) {
  const room = await roomsCollection.getRoomById(roomId)
  if (!room) throw error(404, 'Study room not found')
  return room
}

export async function createRoom (data) {
  if (!data.name || !data.capacity || !data.equipment) {
    throw error(400, 'Study room data incomplete')
  }

  if (
    typeof data.name !== 'string' ||
    typeof data.capacity !== 'number' ||
    !Array.isArray(data.equipment)
  ) {
    throw error(400, 'Invalid study room data types')
  }

  if (data.capacity <= 0) {
    throw error(400, 'Capacity must be a positive number')
  }

  const existing = await roomsCollection.getRoomByName(data.name)
  if (existing) {
    throw error(409, 'Study room with this name already exists')
  }

  const room = {
    name: data.name,
    capacity: data.capacity,
    equipment: data.equipment,
    available: true,
    createdAt: new Date()
  }

  return roomsCollection.createRoom(room)
}

export async function updateRoom (roomId, data) {
  const room = await roomsCollection.getRoomById(roomId)
  if (!room) throw error(404, 'Study room not found')

  if (data.name && typeof data.name !== 'string') {
    throw error(400, 'Invalid name type')
  }

  if (data.capacity && (typeof data.capacity !== 'number' || data.capacity <= 0)) {
    throw error(400, 'Invalid capacity')
  }

  if (data.equipment && !Array.isArray(data.equipment)) {
    throw error(400, 'Invalid equipment type')
  }

  return roomsCollection.updateRoom(roomId, data)
}

export async function deleteRoom (roomId) {
  const room = await roomsCollection.getRoomById(roomId)
  if (!room) throw error(404, 'Study room not found')

  const hasReservations = await reservationsCollection.hasReservationsForRoom(roomId)
  if (hasReservations) {
    throw error(400, 'Cannot delete study room with existing reservations')
  }

  await roomsCollection.deleteRoom(roomId)
}

export function filterStudyRooms (rooms = [], query = {}) {
  let result = rooms

  if (query.available !== undefined) {
    result = result.filter(r => r.available === query.available)
  }

  if (query.minCapacity !== undefined) {
    result = result.filter(r => r.capacity >= query.minCapacity)
  }

  return result
}
