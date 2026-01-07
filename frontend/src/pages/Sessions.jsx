import { useEffect, useMemo, useState } from 'react'
import { Tab, Tabs, Button, Badge } from 'react-bootstrap'

export default function StudySessions() {
  const SESSIONS_ENDPOINT = '/api/study-sessions'
  const ROOMS_ENDPOINT = '/api/study-rooms'

  // Replace this with your actual authentication context later
  const currentUser = {
    _id: "REPLACE_WITH_REAL_USER_ID", 
    role: "student", // or "admin"
    name: "Test User"
  }

  const [sessions, setSessions] = useState([])
  const [rooms, setRooms] = useState([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  const [activeTab, setActiveTab] = useState('all')
  const [search, setSearch] = useState('')
  const [type, setType] = useState('all')

  // 1. FETCH ROOMS (For Linking)
  useEffect(() => {
    async function fetchRooms() {
      try {
        const res = await fetch(ROOMS_ENDPOINT)
        if (res.ok) setRooms(await res.json())
      } catch (err) {
        console.error("Error loading rooms", err)
      }
    }
    fetchRooms()
  }, [])

  // 2. FETCH SESSIONS (With filters)
  const queryString = useMemo(() => {
    const params = new URLSearchParams()
    if (type !== 'all') params.set('type', type)
    if (activeTab === 'mine') params.set('ownerId', currentUser._id)
    return params.toString() ? `?${params}` : ''
  }, [type, activeTab])

  async function fetchSessions() {
    setLoading(true)
    setError('')
    try {
      const res = await fetch(`${SESSIONS_ENDPOINT}${queryString}`)
      if (!res.ok) throw new Error(`HTTP Error ${res.status}`)
      setSessions(await res.json())
    } catch (err) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchSessions()
  }, [queryString])

  // 3. LINKING FUNCTION (Room ID -> Room Name)
  const getRoomName = (roomId) => {
    if (!roomId) return null
    const foundRoom = rooms.find(r => String(r._id) === String(roomId))
    return foundRoom ? foundRoom.name : null
  }

  // 4. JOIN ACTION
  async function handleJoin(sessionId) {
    if (!currentUser._id) return alert("Error: Missing User ID")

    try {
      const res = await fetch(`${SESSIONS_ENDPOINT}/${sessionId}/join`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userId: currentUser._id })
      })

      if (!res.ok) throw new Error("Error joining session")
      
      alert("Success! Joined session.")
      fetchSessions() // Refresh to update participant count
    } catch (err) {
      alert(err.message)
    }
  }

  const filteredSessions = useMemo(() => {
    return sessions.filter(s => s.name?.toLowerCase().includes(search.toLowerCase()))
  }, [sessions, search])

  return (
    <div className="container mt-4">
      <div className="d-flex justify-content-between align-items-center mb-4">
        <h1>Study Sessions</h1>
        {currentUser.role === 'admin' && <Badge bg="danger">Admin Mode</Badge>}
      </div>

      <Tabs activeKey={activeTab} onSelect={(k) => setActiveTab(k)} className="mb-3">
        <Tab eventKey="all" title="All Sessions" />
        <Tab eventKey="mine" title="My Sessions" />
      </Tabs>

      <div className="d-flex gap-2 mb-4">
        <input className="form-control" placeholder="Search..." value={search} onChange={e => setSearch(e.target.value)} />
        <select className="form-select" value={type} onChange={e => setType(e.target.value)}>
          <option value="all">All types</option>
          <option value="physical">In-Person</option>
          <option value="virtual">Virtual</option>
        </select>
        <Button onClick={fetchSessions} disabled={loading}>{loading ? '...' : 'Refresh'}</Button>
      </div>

      {error && <div className="alert alert-danger">{error}</div>}

      <div className="row g-4">
        {filteredSessions.map(session => (
          <div key={session._id} className="col-md-6 col-lg-4">
            <div className="card h-100 shadow-sm border-0">
              <div className="card-header bg-white d-flex justify-content-between align-items-center">
                <h5 className="mb-0 text-primary">{session.name}</h5>
                <Badge bg={session.type === 'virtual' ? 'info' : 'success'}>
                  {session.type === 'virtual' ? 'Virtual' : 'In-Person'}
                </Badge>
              </div>

              <div className="card-body">
                <p className="mb-1"><strong>Subject:</strong> {session.subject}</p>

                {/* Linking Room */}
                {session.type === 'physical' ? (
                   <p className="mb-1">
                     📍 <strong>Location:</strong> {getRoomName(session.roomId) || <span className="text-muted fst-italic">To be defined</span>}
                   </p>
                ) : (
                   <p className="mb-1">💻 <strong>Location:</strong> Online</p>
                )}

                <p className="mb-1">👤 <strong>Organizer:</strong> {session.ownerName || session.ownerId || 'Unknown'}</p>
                <p className="text-muted small">📅 {new Date(session.dateTime).toLocaleString()}</p>

                <div className="mt-3 mb-3">
                  <div className="d-flex justify-content-between small mb-1">
                    <span>Participants</span>
                    <span>{session.participants?.length || 0} / {session.capacity || 10}</span>
                  </div>
                  <div className="progress" style={{height: '6px'}}>
                    <div className="progress-bar bg-success" style={{width: `${((session.participants?.length || 0) / (session.capacity || 10)) * 100}%`}}></div>
                  </div>
                </div>

                <div className="d-flex justify-content-between mt-auto pt-3 border-top">
                    {session.ownerId !== currentUser._id ? (
                        <Button variant="outline-primary" size="sm" onClick={() => handleJoin(session._id)}>
                            Join
                        </Button>
                    ) : (
                        <span className="badge bg-secondary align-self-center">You are organizing</span>
                    )}

                    {currentUser.role === 'admin' && (
                        <Button variant="danger" size="sm" onClick={() => alert("Admin Delete Function")}>
                            Delete
                        </Button>
                    )}
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}