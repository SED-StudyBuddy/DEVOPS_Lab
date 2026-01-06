import { useEffect, useMemo, useState } from 'react'
import { Container, Row, Col, Card, Badge, Form, Button, Stack } from 'react-bootstrap'


export default function Rooms() {
    const ENDPOINT = '/api/study-rooms'

  const [rooms, setRooms] = useState([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  const [search, setSearch] = useState('')
  const [availability, setAvailability] = useState('all')
  const [minCapacity, setMinCapacity] = useState('')

  const queryString = useMemo(() => {
    const params = new URLSearchParams()
    if (availability !== 'all') params.set('available', availability)
    if (minCapacity !== '') params.set('minCapacity', minCapacity)
    return params.toString() ? `?${params}` : ''
  }, [availability, minCapacity])

  async function fetchRooms () {
    setLoading(true)
    setError('')

    try {
      const res = await fetch(`${ENDPOINT}${queryString}`)
      if (!res.ok) {
        throw new Error(`HTTP ${res.status}`)
      }

      console.log(res)

      const data = await res.json()
      setRooms(data)
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
    console.log(rooms)

    return (
        <Container className="py-4">
      <div className="mb-4">
        <h1 className="mb-1">Study Rooms</h1>
        <div className="text-muted">
          Find and reserve available study spaces
        </div>
      </div>

      <Stack
        direction="horizontal"
        gap={2}
        className="mb-4 flex-wrap"
      >
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
          placeholder="Min capacity"
          value={minCapacity}
          onChange={e => setMinCapacity(e.target.value)}
          style={{ maxWidth: 160 }}
        />

        <Button onClick={fetchRooms} disabled={loading}>
          {loading ? 'Loading…' : 'Refresh'}
        </Button>
      </Stack>

      {error && (
        <div className="text-danger mb-3">{error}</div>
      )}

      <Row xs={1} sm={2} md={3} lg={3} className="g-4">
        {filteredRooms.map(room => (
          <Col key={room._id}>
            <Card className="h-100 shadow-sm">
              <Card.Body>
                <div className="d-flex justify-content-center align-items-start mb-2">
                  <Card.Title className="fs-5 mb-0">
                    {room.name}
                  </Card.Title>
                </div>
                <div>
                    <Badge bg={room.available ? 'success' : 'danger'}>
                    {room.available ? 'Available' : 'Unavailable'}
                  </Badge>
                </div>

                <Card.Text className="text-muted mb-2">
                  Capacity: <strong>{room.capacity}</strong>
                </Card.Text>

                {room.equipment?.length > 0 && (
                  <div className="d-flex flex-wrap gap-1 justify-content-center">
                    {room.equipment.map((e, i) => (
                      <Badge
                        key={i}
                        bg="secondary"
                        pill
                        className="fw-normal"
                      >
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
                >
                  Reserve
                </Button>
              </Card.Footer>
            </Card>
          </Col>
        ))}
      </Row>
    </Container>
    )
}