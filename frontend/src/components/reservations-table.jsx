import { useEffect, useState, useMemo } from 'react'
import Table from 'react-bootstrap/Table'
import Button from 'react-bootstrap/Button'
import ReservationModal from './ReservationModal'
import { Badge } from 'react-bootstrap'

export default function ReservationsTable() {
  const [rooms, setRooms] = useState([])
  const [reservations, setReservations] = useState([])
const [showModal, setShowModal] = useState(false)
const [selectedReservation, setSelectedReservation] = useState(null)
const [userSearch, setUserSearch] = useState('')
const [roomFilter, setRoomFilter] = useState('all')
const [dateFilter, setDateFilter] = useState('')
const [timeFilter, setTimeFilter] = useState('')


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
        "endTime": data.endTime,
        "status": data.status
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
  const controller = new AbortController()

  const fetchReservations = async () => {
    try {
      const params = new URLSearchParams()

      if (userSearch) params.append('user', userSearch)
      if (roomFilter !== 'all') params.append('roomId', roomFilter)
      if (dateFilter) params.append('date', dateFilter)
      if (timeFilter) params.append('time', timeFilter)

      const res = await fetch(`/api/reservations?${params.toString()}`, {
        signal: controller.signal
      })

      const data = await res.json()
      setReservations(data)
    } catch (err) {
      if (err.name !== 'AbortError') {
        console.error(err)
      }
    }
  }

  fetchReservations()

  return () => controller.abort()
}, [userSearch, roomFilter, dateFilter, timeFilter])

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
  <div className="d-flex gap-2 mb-3 px-5">
    <input
      className="form-control"
      placeholder="Search by user"
      value={userSearch}
      onChange={e => setUserSearch(e.target.value)}
    />

    <select
      className="form-select"
      value={roomFilter}
      onChange={e => setRoomFilter(e.target.value)}
    >
      <option value="all">All rooms</option>
        {rooms.map(room => (
          <option key={room._id} value={room._id}>
           {room.name}
          </option>
      ))}
    </select>

      <input
        type="date"
        className="form-control"
        value={dateFilter}
        onChange={e => setDateFilter(e.target.value)}
      />

      <input
        type="time"
        className="form-control"
        value={timeFilter}
        onChange={e => setTimeFilter(e.target.value)}
      />
    </div>
      <Table striped bordered hover>
        <thead>
          <tr>
            <th>User</th>
            <th>Room</th>
            <th>Date</th>
            <th>Start Time</th>
            <th>End Time</th>
            <th>Status</th>
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
              <td><Badge bg={
                r.status === 'Scheduled' ? 'primary' :
                r.status === 'Completed' ? 'success' :
                r.status === 'Cancelled' ? 'danger' : 'secondary'
              }>
                {r.status}
              </Badge></td>
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
