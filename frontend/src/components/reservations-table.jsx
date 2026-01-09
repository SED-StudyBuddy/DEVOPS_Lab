import { useEffect, useState, useMemo } from 'react'
import Table from 'react-bootstrap/Table'
import Button from 'react-bootstrap/Button'
import ReservationModal from './ReservationModal'
import { Badge } from 'react-bootstrap'
import { InputGroup, Dropdown } from 'react-bootstrap'
import Form from 'react-bootstrap/Form'

export default function ReservationsTable() {
  const [rooms, setRooms] = useState([])
  const [reservations, setReservations] = useState([])
const [showModal, setShowModal] = useState(false)
const [selectedReservation, setSelectedReservation] = useState(null)
const [roomFilter, setRoomFilter] = useState('all')
const [dateFilter, setDateFilter] = useState('')
const [timeFilter, setTimeFilter] = useState('')
const [users, setUsers] = useState([])
const [userSearchText, setUserSearchText] = useState('')
const [selectedUserId, setSelectedUserId] = useState(null)
const [showUserDropdown, setShowUserDropdown] = useState(false)

useEffect(() => {
  fetch('/api/users')
    .then(res => res.json())
    .then(setUsers)
    .catch(console.error)
}, [])

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

      if (selectedUserId) params.append('user', selectedUserId)
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
}, [selectedUserId, roomFilter, dateFilter, timeFilter])

  const roomMap = useMemo(() => {
    return Object.fromEntries(
      rooms.map(room => [room._id, room.name])
    )
  }, [rooms])

  const userMap = useMemo(() => {
  return Object.fromEntries(
    users.map(u => [u._id, u.fullName])
  )
}, [users])


   const reservationsWithNames = useMemo(() => {
  return reservations.map(r => ({
    ...r,
    roomName: roomMap[r.roomId] ?? 'Unknown room',
    userName: userMap[r.user] ?? 'Unknown user'
  }))
}, [reservations, roomMap, userMap])

const filteredUsers = useMemo(() => {
  if (!userSearchText) return users
  return users.filter(u =>
    u.fullName.toLowerCase().includes(userSearchText.toLowerCase())
  )
}, [users, userSearchText])


return (
    <>
  <div className="d-flex align-items-start gap-2 mb-3 px-5">

  <div className="d-flex align-items-start" style={{ minWidth: 350 }}>
    <div className="position-relative flex-grow-1">
      <input
        className="form-control"
        placeholder="Search room by user"
        value={userSearchText}
        onChange={e => {
          setUserSearchText(e.target.value)
          setShowUserDropdown(true)
          setSelectedUserId(null)
        }}
        onFocus={() => setShowUserDropdown(true)}
      />

      {showUserDropdown && filteredUsers.length > 0 && (
        <div
          className="list-group position-absolute w-100"
          style={{ maxHeight: 250, overflowY: 'auto', zIndex: 1000 }}
        >
          {filteredUsers.map(user => (
            <button
              key={user._id}
              type="button"
              className="list-group-item list-group-item-action"
              onClick={() => {
                setSelectedUserId(user._id)
                setUserSearchText(user.fullName)
                setShowUserDropdown(false)
              }}
            >
              {user.fullName}
            </button>
          ))}
        </div>
      )}
    </div>

    <Button
      variant="outline-danger"
      className="ms-2 me-3"
      onClick={() => {
        setSelectedUserId(null)
        setUserSearchText('')
      }}
    >
      Clear
    </Button>
  </div>

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
          {reservationsWithNames.map(r => (
            <tr key={r._id}>
              <td>{r.userName}</td>
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
    users={users}
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
