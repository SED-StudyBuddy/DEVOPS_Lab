import { useEffect, useState } from 'react'
import Table from 'react-bootstrap/Table'
import Button from 'react-bootstrap/Button'
import RoomModal from './RoomModal'
import Form from 'react-bootstrap/Form'
import FloatingLabel from 'react-bootstrap/FloatingLabel'
import Col from 'react-bootstrap/Col'

export default function RoomsTable() {
  const [rooms, setRooms] = useState([])
  const [showModal, setShowModal] = useState(false)
  const [selectedRoom, setSelectedRoom] = useState(null)
  const [search, setSearch] = useState('')
  const [availability, setAvailability] = useState('all')

useEffect(() => {
  const controller = new AbortController()

  const fetchRooms = async () => {
    try {
      const params = new URLSearchParams()

      if (search) params.append('name', search)
      if (availability !== 'all') params.append('available', availability)

      const res = await fetch(`/api/study-rooms?${params.toString()}`, {
        signal: controller.signal
      })

      const data = await res.json()
      setRooms(data)
    } catch (err) {
      if (err.name !== 'AbortError') {
        console.error(err)
      }
    }
  }

  fetchRooms()

  return () => controller.abort()
}, [availability, search])

  const handleEdit = (room) => {
    setSelectedRoom(room)
    setShowModal(true)
  }

  const handleDelete = async (id) => {
    if (!window.confirm('Are you sure?')) return

    await fetch(`/api/study-rooms/${id}`, {
      method: 'DELETE',
    })

    setRooms(prev => prev.filter(room => room._id !== id))
  }

  const handleSave = async (updatedRoom) => {
    if (!updatedRoom._id) {
      // Create new room
      const res = await fetch('/api/study-rooms', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          "name": updatedRoom.name,
          "capacity": updatedRoom.capacity,
            "equipment": updatedRoom.equipment,
            "available": updatedRoom.available
        }),
        })
        const saved = await res.json()
        setRooms(prev => [...prev, saved])
        setShowModal(false)
        return
    }
    
    // Update existing room
    const res = await fetch(`/api/study-rooms/${updatedRoom._id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        "name": updatedRoom.name,
        "capacity": updatedRoom.capacity,
        "equipment": updatedRoom.equipment,
        "available": updatedRoom.available
      }),
    })
    const saved = await res.json()

    setRooms(prev =>
      prev.map(r => (r._id === saved._id ? saved : r))
    )

    setShowModal(false)
  }

  return (
    <>
    <div className="d-flex gap-2 mb-3 px-5">
        <Col>
        <Form.Control className="h-100"
          type="text"
          placeholder="Search room by name"
          value={search}
          onChange={e => setSearch(e.target.value)}
        />
        </Col>
        <Col>
        <FloatingLabel
          controlId="floatingSelectGrid"
          label="Filter by Availability"
        >
        <Form.Select aria-label="Floating label"
          value={availability}
          onChange={e => setAvailability(e.target.value)}
        >
          <option value="all">All</option>
          <option value="true">Available</option>
          <option value="false">Unavailable</option>
        </Form.Select>
        </FloatingLabel>
        </Col>
    </div>
    <div className="text-end">
      <Button variant="success" className="m-2" onClick={() => {
        setSelectedRoom(null)
        setShowModal(true)
      }}>
        Add New Room
      </Button>
    </div>
      <Table striped bordered hover>
        <thead>
          <tr>
            <th>Name</th>
            <th>Capacity</th>
            <th>Equipment</th>
            <th>Available</th>
            <th>Action</th>
          </tr>
        </thead>
        <tbody>
          {rooms.map(room => (
            <tr key={room._id}>
              <td>{room.name}</td>
              <td>{room.capacity}</td>
              <td>{room.equipment.join(', ')}</td>
              <td>{room.available ? 'Yes' : 'No'}</td>
              <td>
                <Button
                  size="sm"
                  variant="primary"
                  className="me-2"
                  onClick={() => handleEdit(room)}
                >
                  Edit
                </Button>

                <Button
                  size="sm"
                  variant="danger"
                  onClick={() => handleDelete(room._id)}
                >
                  Delete
                </Button>
              </td>
            </tr>
          ))}
        </tbody>
      </Table>

      <RoomModal
        key={selectedRoom?._id}
        show={showModal}
        room={selectedRoom}
        onClose={() => setShowModal(false)}
        onSave={handleSave}
      />
    </>
  )
}
