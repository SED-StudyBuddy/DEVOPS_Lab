import * as roomsCollection from '../db/studyrooms_collection.js'
import * as reservationsCollection from '../db/reservations_collection.js'
import { DomainError } from '../errors/DomainError.js'
import { ObjectId } from 'mongodb'

export async function getStudyRooms (query) {
  let rooms = await roomsCollection.getAllStudyRooms()

  if (query.available !== undefined) {
    const available = query.available === 'true'
    rooms = rooms.filter(r => r.available === available)
  }

  if (query.minCapacity !== undefined) {
    const minCapacity = Number(query.minCapacity)
    rooms = rooms.filter(r => r.capacity >= minCapacity)
  }

  return rooms
}

export async function getStudyRoomById (roomId) {
  const room = await roomsCollection.getStudyRoomById(roomId)
  if (!room) {
    throw new DomainError('ROOM_NOT_FOUND', 'Study room not found')
  }
  return room
}

export async function createStudyRoom (data) {
  validateStudyRoomInput(data)

  const existing = await roomsCollection.getStudyRoomByName(data.name)
  if (existing) {
    throw new DomainError(
      'DUPLICATE_ROOM',
      'Study room with this name already exists'
    )
  }

  return roomsCollection.createStudyRoom(data)
}

export async function updateStudyRoom (roomId, data) {
  const room = await roomsCollection.getStudyRoomById(roomId)
  if (!room) {
    throw new DomainError('ROOM_NOT_FOUND', 'Study room not found')
  }

  validateStudyRoomInput(data, { partial: true })

  if (data.name !== undefined) {
    const existing = await roomsCollection.getStudyRoomByName(data.name)
    if (existing && existing._id.toString() !== roomId.toString()) {
      throw new DomainError(
        'DUPLICATE_ROOM',
        'Study room with this name already exists'
      )
    }
  }

  return roomsCollection.updateStudyRoom(roomId, data)
}

export async function deleteStudyRoom (roomId) {
  const room = await roomsCollection.getStudyRoomById(roomId)
  if (!room) {
    throw new DomainError('ROOM_NOT_FOUND', 'Study room not found')
  }

  const reservations = await reservationsCollection.getReservations({ roomId: new ObjectId(roomId) })

  if (reservations.length > 0) {
    throw new DomainError(
      'ROOM_HAS_RESERVATIONS',
      'Cannot delete study room with existing reservations'
    )
  }

  await roomsCollection.deleteStudyRoom(roomId)
}

function validateStudyRoomInput (data, { partial = false } = {}) {
  const { name, capacity, equipment } = data

  if (!partial) {
    if (!name || capacity === undefined || !equipment) {
      throw new DomainError(
        'INVALID_INPUT',
        'Study room data incomplete'
      )
    }
  }

  if (name !== undefined && typeof name !== 'string') {
    throw new DomainError(
      'INVALID_INPUT',
      'Invalid name type'
    )
  }

  if (
    capacity !== undefined &&
    (typeof capacity !== 'number' || capacity <= 0)
  ) {
    throw new DomainError(
      'INVALID_INPUT',
      'Capacity must be a positive number'
    )
  }

  if (equipment !== undefined && !Array.isArray(equipment)) {
    throw new DomainError(
      'INVALID_INPUT',
      'Invalid equipment type'
    )
  }
}
