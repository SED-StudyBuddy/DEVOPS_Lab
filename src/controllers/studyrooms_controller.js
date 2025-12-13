import * as service from '../services/studyrooms_service.js'
import { DomainError } from '../errors/DomainError.js'

export async function getStudyRooms (req, res) {
  try {
    const rooms = await service.getStudyRooms(req.query)
    res.json(rooms)
  } catch (err) {
    if (err instanceof DomainError) {
      return res.status(400).json({ message: err.message })
    }
    res.status(500).json({ message: 'Internal server error' })
  }
}

export async function getStudyRoomById (req, res) {
  try {
    const room = await service.getStudyRoomById(req.params.roomId)
    res.json(room)
  } catch (err) {
    if (err instanceof DomainError) {
      return res.status(404).json({ message: err.message })
    }
    res.status(500).json({ message: 'Internal server error' })
  }
}

export async function createStudyRoom (req, res) {
  try {
    const room = await service.createStudyRoom(req.body)
    res.status(201).json(room)
  } catch (err) {
    if (err instanceof DomainError) {
      const statusMap = {
        INVALID_INPUT: 400,
        DUPLICATE_ROOM: 409
      }

      return res
        .status(statusMap[err.code] || 400)
        .json({ message: err.message })
    }
    res.status(500).json({ message: 'Internal server error' })
  }
}

export async function updateStudyRoom (req, res) {
  try {
    const room = await service.updateStudyRoom(
      req.params.roomId,
      req.body
    )
    res.status(200).json(room)
  } catch (err) {
    if (err instanceof DomainError) {
      const statusMap = {
        ROOM_NOT_FOUND: 404,
        INVALID_INPUT: 400,
        DUPLICATE_ROOM: 409
      }

      return res
        .status(statusMap[err.code] || 400)
        .json({ message: err.message })
    }
    res.status(500).json({ message: 'Internal server error' })
  }
}

export async function deleteStudyRoom (req, res) {
  try {
    await service.deleteStudyRoom(req.params.roomId)
    res.json({ message: 'Study room deleted successfully' })
  } catch (err) {
    if (err instanceof DomainError) {
      const statusMap = {
        ROOM_NOT_FOUND: 404,
        ROOM_HAS_RESERVATIONS: 400
      }

      return res
        .status(statusMap[err.code] || 400)
        .json({ message: err.message })
    }
    res.status(500).json({ message: 'Internal server error' })
  }
}
