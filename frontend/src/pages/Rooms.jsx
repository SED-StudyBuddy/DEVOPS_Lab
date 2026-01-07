import { useEffect, useMemo, useState } from 'react'
import {
  Container,
  Row,
  Col,
  Card,
  Badge,
  Form,
  Button,
  Stack
} from 'react-bootstrap'
import CreateReservationModal from '../components/CreateReservationModal'

export default function RoomsPage() {
  const ENDPOINT = '/api/study-rooms'

  const [rooms, setRooms] = useState([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  const [search, setSearch] = useState('')
  const [availability, setAvailability] = useState('all')
  const [minCapacity, setMinCapacity] = useState('')

  const [showModal, setShowModal] = useState(false)
  const [selectedRoom, setSelectedRoom] = useState(null)

  const queryString = useMemo(() => {
    const params = new URLSearchParams()
    if (availability !== 'all') params.set('available', availability)
    if (minCapacity !== '') params.set('minCapacity', minCapacity)
    return params.toString() ? `?${params}` : ''
  }, [availability, minCapacity])

  async function fetchRooms() {
    setLoading(true)
    setError('')
    try {
      const res = await fetch(`${ENDPOINT}${queryString}`)
      if (!res.ok) throw new Error(`HTTP ${res.status}`)
      setRooms(await res.json())
    } catch (err) {
      setError(err.message ?? 'Failed to load rooms')
      setRooms([])
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchRooms()
  }, [queryString])

  const filteredRooms = useMemo(() => {
    const q = search.toLowerCase()
    return rooms.filter(r =>
      r.name?.toLowerCase().includes(q)
    )
  }, [rooms, search])

  function openReservationModal(room) {
    setSelectedRoom(room)
    setShowModal(true)
  }

  return (
    <>
      <Container className="py-4">
        <h1 className="mb-1">Study Rooms</h1>
        <div className="text-muted mb-4">
          Find and reserve available study spaces
        </div>

        <Stack direction="horizontal" gap={2} className="mb-4 flex-wrap">
          <Form.Control
            placeholder="Search by name"
            value={search}
            onChange={e => setSearch(e.target.value)}
            style={{ maxWidth: 220 }}
          />

          <Form.Select
            value={availability}
            onChange={e => setAvailability(e.target.value)}
            style={{ maxWidth: 180 }}
          >
            <option value="all">All</option>
            <option value="true">Available</option>
            <option value="false">Unavailable</option>
          </Form.Select>

          <Form.Control
            type="number"
            placeholder="Minimum capacity"
            value={minCapacity}
            onChange={e => setMinCapacity(e.target.value)}
            style={{ maxWidth: 165 }}
          />

          <Button onClick={fetchRooms} disabled={loading}>
            {loading ? 'Loading…' : 'Refresh'}
          </Button>
        </Stack>

        {error && <div className="text-danger mb-3">{error}</div>}

        <Row xs={1} sm={2} md={3} lg={3} className="g-4">
          {filteredRooms.map(room => (
            <Col key={room._id}>
              <Card className="h-100 shadow-sm">
                <Card.Body className="text-center">
                  <Card.Title>{room.name}</Card.Title>

                  <Badge bg={room.available ? 'success' : 'danger'} className="mb-2">
                    {room.available ? 'Available' : 'Unavailable'}
                  </Badge>

                  <Card.Text className="text-muted">
                    Capacity: <strong>{room.capacity}</strong>
                  </Card.Text>

                  {room.equipment?.length > 0 && (
                    <div className="d-flex flex-wrap gap-1 justify-content-center">
                      {room.equipment.map((e, i) => (
                        <Badge key={i} bg="secondary" pill>
                          {e}
                        </Badge>
                      ))}
                    </div>
                  )}
                </Card.Body>

                <Card.Footer className="bg-transparent border-0">
                  <Button
                    size="sm"
                    variant="outline-primary"
                    className="w-100"
                    disabled={!room.available}
                    onClick={() => openReservationModal(room)}
                  >
                    Reserve
                  </Button>
                </Card.Footer>
              </Card>
            </Col>
          ))}
        </Row>
      </Container>

      <CreateReservationModal
        show={showModal}
        onClose={() => setShowModal(false)}
        room={selectedRoom}
        onSuccess={fetchRooms}
      />
    </>
  )
}
