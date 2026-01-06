import { useEffect, useMemo, useState } from 'react'

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
        <div className="container">
            <h1>Study Rooms</h1>

      <div className="filters">
        <input
          placeholder="Search by name"
          value={search}
          onChange={e => setSearch(e.target.value)}
        />

        <select
          value={availability}
          onChange={e => setAvailability(e.target.value)}
        >
          <option value="all">All</option>
          <option value="true">Available</option>
          <option value="false">Unavailable</option>
        </select>

        <input
          type="number"
          placeholder="Min capacity"
          value={minCapacity}
          onChange={e => setMinCapacity(e.target.value)}
        />

        <button onClick={fetchRooms} disabled={loading}>
          {loading ? 'Loading…' : 'Refresh'}
        </button>
      </div>

      {error && <p className="error">{error}</p>}

      <div className="grid">
        {filteredRooms.map(room => (
          <div key={room._id} className="card">
            <div className="card-header">
              <h3>{room.name}</h3>
              <span className={room.available ? 'available' : 'unavailable'}>
                {room.available ? 'Available' : 'Unavailable'}
              </span>
            </div>

            <p><strong>Capacity:</strong> {room.capacity}</p>

            {room.equipment?.length > 0 && (
              <div className="equipment">
                {room.equipment.map((e, i) => (
                  <span key={i} className="tag">{e}</span>
                ))}
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
    )
}