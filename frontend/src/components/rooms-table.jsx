import { useEffect, useState } from 'react'
import Table from 'react-bootstrap/Table'
import Button from 'react-bootstrap/Button'
import RoomModal from './RoomModal'

export default function RoomsTable() {
  const [rooms, setRooms] = useState([])
  const [showModal, setShowModal] = useState(false)
  const [selectedRoom, setSelectedRoom] = useState(null)

  useEffect(() => {
    fetch('/api/study-rooms')
      .then(res => res.json())
      .then(data => setRooms(data))
      .catch(err => console.error(err))
  }, [])

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
            <th>Id</th>
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
              <td>{room._id}</td>
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
