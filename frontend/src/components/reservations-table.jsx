import { useEffect, useState, useMemo } from 'react'
import Table from 'react-bootstrap/Table'
import Button from 'react-bootstrap/Button'
import ReservationModal from './ReservationModal'

export default function ReservationsTable() {
  const [rooms, setRooms] = useState([])
  const [reservations, setReservations] = useState([])
const [showModal, setShowModal] = useState(false)
const [selectedReservation, setSelectedReservation] = useState(null)

const openEdit = reservation => {
  setSelectedReservation(reservation)
  setShowModal(true)
}

const deleteReservation = async id => {
    if (!window.confirm('Are you sure?')) return
    await fetch(`/api/reservations/${id}`, {
        method: 'DELETE'
    })
    setReservations(prev => prev.filter(r => r._id !== id))
}

const saveReservation = async data => {
    await fetch(`/api/reservations/${data._id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        "user": data.user,
        "roomId": data.roomId,
        "date": data.date,
        "startTime": data.startTime,
        "endTime": data.endTime
      })
    })

  setShowModal(false)
  setReservations(prev => prev.map(r => r._id === data._id ? data : r))
}

  useEffect(() => {
    fetch('/api/study-rooms')
      .then(res => res.json())
      .then(setRooms)
  }, [])

  useEffect(() => {
    fetch('/api/reservations')
      .then(res => res.json())
      .then(setReservations)
  }, [])

  const roomMap = useMemo(() => {
    return Object.fromEntries(
      rooms.map(room => [room._id, room.name])
    )
  }, [rooms])

   const reservationsWithRoomName = useMemo(() => {
    return reservations.map(r => ({
      ...r,
      roomName: roomMap[r.roomId] ?? 'Unknown room'
    }))
}, [reservations, roomMap])
  

return (
    <>
      <Table striped bordered hover>
        <thead>
          <tr>
            <th>User</th>
            <th>Room</th>
            <th>Date</th>
            <th>Start Time</th>
            <th>End Time</th>
            <th>Action</th>
          </tr>
        </thead>
        <tbody>
          {reservationsWithRoomName.map(r => (
            <tr key={r._id}>
              <td>{r.user}</td>
              <td>{r.roomName}</td>
              <td>{r.date}</td>
              <td>{r.startTime}</td>
              <td>{r.endTime}</td>
              <td>
                <Button size="sm" onClick={() => openEdit(r)}>Edit</Button>
                <Button
                    size="sm"
                    variant="danger"
                    className="ms-2"
                    onClick={() => deleteReservation(r._id)}>
                 Delete
                </Button>
                </td>
            </tr>
          ))}
        </tbody>
      </Table>

      <ReservationModal
    key={selectedReservation?._id ?? null}
    show={showModal}
    reservation={selectedReservation}
    rooms={rooms}
    onClose={() => {
      setShowModal(false)
      setSelectedReservation(null)
    }}
    onSave={(data) => {
      saveReservation(data)
      setShowModal(false)
    }}
  />
  </>
  )
}
