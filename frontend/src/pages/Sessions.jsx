import { useEffect, useState } from 'react'
import { apiFetch } from '../api' 

export default function AdminStudySessions() {
  const [sessions, setSessions] = useState([])
  const [loading, setLoading] = useState(false)
  const [currentUser, setCurrentUser] = useState(null)
  const [msg, setMsg] = useState('')
  const [showModal, setShowModal] = useState(false)
  const [editing, setEditing] = useState(null)
  const [form, setForm] = useState({})

  useEffect(() => {
    // Récupération de l'utilisateur connecté via la clé 'auth' du login
    const authData = localStorage.getItem('auth') || localStorage.getItem('user');
    if (authData) {
      try {
        const parsed = JSON.parse(authData);
        setCurrentUser(parsed.user || parsed);
      } catch (e) { console.error("Erreur auth", e); }
    }
    loadData();
  }, [])

  const loadData = async () => {
    setLoading(true)
    try {
      const data = await apiFetch('/api/study-sessions')
      setSessions(data)
    } catch (e) { setMsg('Erreur de chargement') }
    setLoading(false)
  }

  const save = async () => {
    if (!form.name || !form.subject || !form.date || !form.time) {
      setMsg('Veuillez remplir tous les champs');
      return;
    }
    const payload = { 
      ...form, 
      dateTime: `${form.date}T${form.time}`,
      capacity: parseInt(form.capacity) || 10,
      ownerId: currentUser?._id || currentUser?.id
    };

    try {
      const url = editing ? `/api/study-sessions/${editing._id}` : '/api/study-sessions';
      await apiFetch(url, {
        method: editing ? 'PUT' : 'POST',
        body: JSON.stringify(payload)
      });
      setShowModal(false);
      loadData();
      setMsg(editing ? 'Modifié !' : 'Créé !');
    } catch (e) { setMsg('Erreur sauvegarde'); }
  }

  const del = async (id) => {
    if (currentUser?.role !== 'admin') return alert("Admin requis");
    if (!window.confirm('Supprimer cette session ?')) return;
    try {
      await apiFetch(`/api/study-sessions/${id}`, { method: 'DELETE' });
      loadData();
    } catch (e) { setMsg('Erreur suppression'); }
  }

  const handleJoinToggle = async (session) => {
    const userId = currentUser?._id || currentUser?.id;
    if (!userId) return;
    const isJoined = session.participants?.includes(userId);
    const action = isJoined ? 'leave' : 'join';
    try {
      await apiFetch(`/api/study-sessions/${session._id}/${action}`, {
        method: 'POST',
        body: JSON.stringify({ userId })
      });
      await loadData();
    } catch (e) { setMsg("Erreur d'inscription"); }
  }

  const openModal = (s = null) => {
    setEditing(s);
    if (s) {
      const d = new Date(s.dateTime);
      setForm({ ...s, date: d.toISOString().split('T')[0], time: d.toTimeString().slice(0, 5) });
    } else {
      setForm({ name: '', subject: '', date: '', time: '', capacity: 10 });
    }
    setShowModal(true);
  }

  const isAdmin = currentUser?.role === 'admin';

  return (
    <div className="p-3 bg-white rounded shadow-sm border">
      <div className="d-flex justify-content-between align-items-center mb-4">
        <div>
          <h5 className="fw-bold mb-0 text-primary">Manage Study Sessions</h5>
          <small className="text-muted">Connecté : <b>{currentUser?.fullName}</b> ({currentUser?.role})</small>
        </div>
        <button onClick={() => openModal()} className="btn btn-primary btn-sm fw-bold px-3">+ Create Session</button>
      </div>

      {msg && <div className="alert alert-info py-2 small">{msg}</div>}

      <div className="table-responsive">
        <table className="table table-hover align-middle border-top">
          <thead className="table-light small fw-bold text-secondary">
            <tr>
              <th>SESSION</th>
              <th>SUBJECT</th>
              <th className="text-center">CAPACITY</th>
              <th className="text-end">ACTIONS</th>
            </tr>
          </thead>
          <tbody>
            {sessions.map(s => {
              const hasJoined = currentUser && s.participants?.includes(currentUser._id || currentUser.id);
              return (
                <tr key={s._id} className={hasJoined ? 'table-primary' : ''}>
                  <td>
                    <div className="fw-bold">{s.name} {hasJoined && "😊"}</div>
                    <div className="small text-muted">{new Date(s.dateTime).toLocaleDateString()}</div>
                  </td>
                  <td>{s.subject}</td>
                  <td className="text-center small font-monospace">{s.participants?.length || 0} / {s.capacity}</td>
                  <td className="text-end">
                    <button onClick={() => handleJoinToggle(s)} className={`btn btn-sm fw-bold me-2 ${hasJoined ? 'text-danger' : 'text-primary'}`}>
                      {hasJoined ? 'LEAVE' : 'JOIN'}
                    </button>
                    <button onClick={() => openModal(s)} className="btn btn-link btn-sm text-secondary text-decoration-none fw-bold p-0 me-2">EDIT</button>
                    {isAdmin && (
                      <button onClick={() => del(s._id)} className="btn btn-link btn-sm text-danger text-decoration-none fw-bold p-0">DELETE</button>
                    )}
                  </td>
                </tr>
              )
            })}
          </tbody>
        </table>
      </div>

      {showModal && (
        <div className="modal show d-block shadow" style={{backgroundColor: 'rgba(0,0,0,0.5)'}}>
          <div className="modal-dialog modal-dialog-centered">
            <div className="modal-content border-0">
              <div className="modal-header bg-dark text-white py-2">
                <h6 className="modal-title fw-bold">{editing ? 'Edit Session' : 'New Session'}</h6>
                <button onClick={() => setShowModal(false)} className="btn-close btn-close-white"></button>
              </div>
              <div className="modal-body p-4">
                <label className="small fw-bold text-muted mb-1">SESSION NAME</label>
                <input className="form-control mb-3" value={form.name || ''} onChange={e => setForm({...form, name: e.target.value})} />
                
                <label className="small fw-bold text-muted mb-1">SUBJECT</label>
                <input className="form-control mb-3" value={form.subject || ''} onChange={e => setForm({...form, subject: e.target.value})} />
                
                <div className="row g-2 mb-3">
                  <div className="col"><label className="small fw-bold text-muted mb-1">DATE</label><input type="date" className="form-control" value={form.date || ''} onChange={e => setForm({...form, date: e.target.value})} /></div>
                  <div className="col"><label className="small fw-bold text-muted mb-1">TIME</label><input type="time" className="form-control" value={form.time || ''} onChange={e => setForm({...form, time: e.target.value})} /></div>
                </div>

                <label className="small fw-bold text-muted mb-1">MAX CAPACITY</label>
                <input type="number" className="form-control" value={form.capacity || ''} onChange={e => setForm({...form, capacity: e.target.value})} />
              </div>
              <div className="modal-footer bg-light border-0">
                <button onClick={() => setShowModal(false)} className="btn btn-sm btn-link text-muted text-decoration-none">Cancel</button>
                <button onClick={save} className="btn btn-sm btn-dark px-4 fw-bold">Save Session</button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}