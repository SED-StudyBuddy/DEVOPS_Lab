import { useEffect, useMemo, useState } from 'react'
import { Tab, Tabs, Button, Badge } from 'react-bootstrap'

export default function StudySessions() {
  const SESSIONS_ENDPOINT = '/api/study-sessions'
  const ROOMS_ENDPOINT = '/api/study-rooms'

  // À remplacer par votre contexte d'authentification réel plus tard
  const currentUser = {
    _id: "REMPLACE_CECI_PAR_UN_VRAI_USER_ID", 
    role: "student", // ou "admin"
    name: "Utilisateur Test"
  }

  const [sessions, setSessions] = useState([])
  const [rooms, setRooms] = useState([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  const [activeTab, setActiveTab] = useState('all')
  const [search, setSearch] = useState('')
  const [type, setType] = useState('all')

  // 1. CHARGEMENT DES SALLES (Pour le Linking)
  useEffect(() => {
    async function fetchRooms() {
      try {
        const res = await fetch(ROOMS_ENDPOINT)
        if (res.ok) setRooms(await res.json())
      } catch (err) {
        console.error("Erreur chargement salles", err)
      }
    }
    fetchRooms()
  }, [])

  // 2. CHARGEMENT DES SESSIONS (Avec filtres)
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
      if (!res.ok) throw new Error(`Erreur HTTP ${res.status}`)
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

  // 3. FONCTION LINKING (ID Salle -> Nom Salle)
  const getRoomName = (roomId) => {
    if (!roomId) return null
    const foundRoom = rooms.find(r => String(r._id) === String(roomId))
    return foundRoom ? foundRoom.name : null
  }

  // 4. ACTION REJOINDRE
  async function handleJoin(sessionId) {
    if (!currentUser._id) return alert("Erreur: ID utilisateur manquant")

    try {
      const res = await fetch(`${SESSIONS_ENDPOINT}/${sessionId}/join`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userId: currentUser._id })
      })

      if (!res.ok) throw new Error("Erreur lors de l'inscription")
      
      alert("Succès ! Session rejointe.")
      fetchSessions() // Mise à jour de l'affichage
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
        <h1>Sessions d'étude</h1>
        {currentUser.role === 'admin' && <Badge bg="danger">Mode Admin</Badge>}
      </div>

      <Tabs activeKey={activeTab} onSelect={(k) => setActiveTab(k)} className="mb-3">
        <Tab eventKey="all" title="Toutes les sessions" />
        <Tab eventKey="mine" title="Mes sessions" />
      </Tabs>

      <div className="d-flex gap-2 mb-4">
        <input className="form-control" placeholder="Rechercher..." value={search} onChange={e => setSearch(e.target.value)} />
        <select className="form-select" value={type} onChange={e => setType(e.target.value)}>
          <option value="all">Tous les types</option>
          <option value="physical">Présentiel</option>
          <option value="virtual">Virtuel</option>
        </select>
        <Button onClick={fetchSessions} disabled={loading}>{loading ? '...' : 'Actualiser'}</Button>
      </div>

      {error && <div className="alert alert-danger">{error}</div>}

      <div className="row g-4">
        {filteredSessions.map(session => (
          <div key={session._id} className="col-md-6 col-lg-4">
            <div className="card h-100 shadow-sm border-0">
              <div className="card-header bg-white d-flex justify-content-between align-items-center">
                <h5 className="mb-0 text-primary">{session.name}</h5>
                <Badge bg={session.type === 'virtual' ? 'info' : 'success'}>
                  {session.type === 'virtual' ? 'Virtuel' : 'Présentiel'}
                </Badge>
              </div>

              <div className="card-body">
                <p className="mb-1"><strong>Matière :</strong> {session.subject}</p>

                {/* Linking Salle */}
                {session.type === 'physical' ? (
                   <p className="mb-1">
                     📍 <strong>Lieu :</strong> {getRoomName(session.roomId) || <span className="text-muted fst-italic">Lieu à définir</span>}
                   </p>
                ) : (
                   <p className="mb-1">💻 <strong>Lieu :</strong> En ligne</p>
                )}

                <p className="mb-1">👤 <strong>Organisateur :</strong> {session.ownerName || session.ownerId || 'Inconnu'}</p>
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
                            Rejoindre
                        </Button>
                    ) : (
                        <span className="badge bg-secondary align-self-center">Vous organisez</span>
                    )}

                    {currentUser.role === 'admin' && (
                        <Button variant="danger" size="sm" onClick={() => alert("Fonction Suppression Admin")}>
                            Supprimer
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