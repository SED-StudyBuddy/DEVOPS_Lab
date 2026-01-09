import { useEffect, useState, useMemo } from 'react'
import { Container, Tabs, Tab } from 'react-bootstrap'
import ReservationModal from '../components/ReservationModal.jsx'
import ReservationTable from '../components/MySessions-table.jsx'
import { getStoredUser } from '../api.js'

export default function MySessionsPage() {
  const [reservations, setReservations] = useState([])
  const [showModal, setShowModal] = useState(false)
  const [selectedReservation, setSelectedReservation] = useState(null)
  const [rooms, setRooms] = useState([])

  useEffect(() => {
    const user = getStoredUser()
    fetch(`/api/reservations?user=${user._id}`).then(r => r.json()).then(setReservations)
    fetch('/api/study-rooms').then(r => r.json()).then(setRooms)
  }, [])

  const now = new Date()

const isReservationUpcoming = (date, startTime) => {

  const [hours, minutes] = startTime.split(':').map(Number)

  const startDateTime = new Date(date)
  startDateTime.setHours(hours, minutes, 0, 0)

  return startDateTime >= now
}

const splitReservationsList = list => ({
  upcoming: list.filter(i => isReservationUpcoming(i.date, i.startTime)),
  past: list.filter(i => !isReservationUpcoming(i.date, i.startTime))
})


  const reservationsByTime = useMemo(() => splitReservationsList(reservations), [reservations])

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

const onCancel = async id => {
  window.confirm('Are you sure you want to cancel this reservation?') && await fetch(`/api/reservations/${id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ status: 'Cancelled' })
    })

    setReservations(prev => prev.map(r => r._id === id ? { ...r, status: 'Cancelled' } : r))
}


  return (
    <Container className="mt-4">
      <h1 className="mb-4">My Reservations</h1>
          <Tabs defaultActiveKey="upcoming" className="mt-3">
            <Tab eventKey="upcoming" title="Upcoming">
              <ReservationTable
                data={reservationsByTime.upcoming}
                onEdit={r => {
                  setSelectedReservation(r)
                  setShowModal(true)
                }}
                onCancel={id => onCancel(id)}
                rooms={rooms}
              />
            </Tab>

            <Tab eventKey="past" title="Past">
              <ReservationTable 
                data={reservationsByTime.past}
                rooms={rooms}
              />
            </Tab>
          </Tabs>

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
    </Container>
  )
}
