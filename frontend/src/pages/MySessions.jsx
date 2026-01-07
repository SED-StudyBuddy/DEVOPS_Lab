import { useEffect, useState, useMemo } from 'react'
import { Container, Tabs, Tab } from 'react-bootstrap'
import ReservationModal from '../components/ReservationModal.jsx'
import ReservationTable from '../components/MySessions-table.jsx'
import SessionCards from '../components/StudySessions-cards.jsx'

export default function MySessionsPage() {
  const [reservations, setReservations] = useState([])
  const [sessions, setSessions] = useState([])
  const [showModal, setShowModal] = useState(false)
  const [selectedReservation, setSelectedReservation] = useState(null)
  const [rooms, setRooms] = useState([])

  useEffect(() => {
    fetch('/api/reservations').then(r => r.json()).then(setReservations)
    fetch('/api/study-sessions').then(r => r.json()).then(setSessions)
    fetch('/api/study-rooms').then(r => r.json()).then(setRooms)
  }, [])

  const now = new Date()
  const isUpcoming = d => new Date(d) >= now

  const split = list => ({
    upcoming: list.filter(i => isUpcoming(i.date)),
    past: list.filter(i => !isUpcoming(i.date))
  })

  const reservationsByTime = useMemo(() => split(reservations), [reservations])
  const sessionsByTime = useMemo(() => split(sessions), [sessions])

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

  return (
    <Container className="mt-4">
      <h1 className="mb-4">My Sessions</h1>

      <Tabs defaultActiveKey="sessions" className="mb-4">
        <Tab eventKey="sessions" title="My Study Sessions">
          <Tabs defaultActiveKey="upcoming" className="mt-3">
            <Tab eventKey="upcoming" title="Upcoming">
              <SessionCards
                sessions={sessionsByTime.upcoming}
                onEdit={id => console.log('edit session', id)}
                onCancel={id => console.log('cancel session', id)}
                onLeave={id => console.log('leave session', id)}
              />
            </Tab>

            <Tab eventKey="past" title="Past">
              <SessionCards sessions={sessionsByTime.past} />
            </Tab>
          </Tabs>
        </Tab>

        <Tab eventKey="reservations" title="My Room Reservations">
          <Tabs defaultActiveKey="upcoming" className="mt-3">
            <Tab eventKey="upcoming" title="Upcoming">
              <ReservationTable
                data={reservationsByTime.upcoming}
                onEdit={r => {
                  setSelectedReservation(r)
                  setShowModal(true)
                }}
                onCancel={id =>
                  setReservations(prev => prev.filter(r => r._id !== id))
                }
                rooms={rooms}
              />
            </Tab>

            <Tab eventKey="past" title="Past">
              <ReservationTable data={reservationsByTime.past} />
            </Tab>
          </Tabs>
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
