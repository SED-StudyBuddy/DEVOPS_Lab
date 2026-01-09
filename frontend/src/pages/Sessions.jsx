import { useEffect, useState } from 'react'
import { apiFetch } from '../api'

// --- Petites icônes SVG légères (pour éviter d'installer une librairie) ---
const IconEdit = () => <svg width="16" height="16" fill="currentColor" viewBox="0 0 16 16"><path d="M12.146.146a.5.5 0 0 1 .708 0l3 3a.5.5 0 0 1 0 .708l-10 10a.5.5 0 0 1-.168.11l-5 2a.5.5 0 0 1-.65-.65l2-5a.5.5 0 0 1 .11-.168l10-10zM11.207 2.5 13.5 4.793 14.793 3.5 12.5 1.207 11.207 2.5zm1.586 3L10.5 3.207 4 9.707V10h.5a.5.5 0 0 1 .5.5v.5h.5a.5.5 0 0 1 .5.5v.5h.293l6.5-6.5zm-9.761 5.175-.106.106-1.528 3.821 3.821-1.528.106-.106A.5.5 0 0 1 5 12.5V12h-.5a.5.5 0 0 1-.5-.5V11h-.5a.5.5 0 0 1-.468-.325z"/></svg>;
const IconTrash = () => <svg width="16" height="16" fill="currentColor" viewBox="0 0 16 16"><path d="M5.5 5.5A.5.5 0 0 1 6 6v6a.5.5 0 0 1-1 0V6a.5.5 0 0 1 .5-.5zm2.5 0a.5.5 0 0 1 .5.5v6a.5.5 0 0 1-1 0V6a.5.5 0 0 1 .5-.5zm3 .5a.5.5 0 0 0-1 0v6a.5.5 0 0 0 1 0V6z"/><path fillRule="evenodd" d="M14.5 3a1 1 0 0 1-1 1H13v9a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V4h-.5a1 1 0 0 1-1-1V2a1 1 0 0 1 1-1H6a1 1 0 0 1 1-1h2a1 1 0 0 1 1 1h3.5a1 1 0 0 1 1 1v1zM4.118 4 4 4.059V13a1 1 0 0 0 1 1h6a1 1 0 0 0 1-1V4.059L11.882 4H4.118zM2.5 3V2h11v1h-11z"/></svg>;
const IconPeople = () => <svg width="16" height="16" fill="currentColor" viewBox="0 0 16 16"><path d="M7 14s-1 0-1-1 1-4 5-4 5 3 5 4-1 1-1 1H7zm4-6a3 3 0 1 0 0-6 3 3 0 0 0 0 6z"/><path fillRule="evenodd" d="M5.216 14A2.238 2.238 0 0 1 5 13c0-1.355.68-2.75 1.936-3.72A6.325 6.325 0 0 0 5 9c-4 0-5 3-5 4s1 1 1 1h4.216z"/></svg>;

export default function AdminStudySessions() {
  const [sessions, setSessions] = useState([])
  const [loading, setLoading] = useState(false)
  const [currentUser, setCurrentUser] = useState(null)
  const [msg, setMsg] = useState('')
  const [showModal, setShowModal] = useState(false)
  const [editing, setEditing] = useState(null)
  const [form, setForm] = useState({})

  useEffect(() => {
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
    <div className="p-4 bg-white rounded shadow-sm border">
      <div className="d-flex justify-content-between align-items-center mb-4">
        <div>
          <h4 className="fw-bold mb-1 text-dark">Study Sessions</h4>
          <div className="text-muted small">
            Bonjour, <span className="fw-bold text-primary">{currentUser?.fullName}</span>
          </div>
        </div>
        <button onClick={() => openModal()} className="btn btn-primary shadow-sm fw-bold px-3">
          <span className="me-1">+</span> New Session
        </button>
      </div>

      {msg && <div className="alert alert-info py-2 small shadow-sm">{msg}</div>}

      <div className="card border-0 shadow-none">
        <div className="table-responsive">
          <table className="table table-hover align-middle" style={{borderCollapse: 'separate', borderSpacing: '0 8px'}}>
            <thead className="small text-uppercase text-muted" style={{fontSize: '0.75rem', letterSpacing: '1px'}}>
              <tr>
                <th className="border-0 ps-3">Details</th>
                <th className="border-0">Subject</th>
                <th className="border-0 text-center">Date & Time</th>
                <th className="border-0" style={{width: '20%'}}>Capacity</th>
                <th className="border-0 text-end pe-3">Actions</th>
              </tr>
            </thead>
            <tbody>
              {sessions.map(s => {
                const hasJoined = currentUser && s.participants?.includes(currentUser._id || currentUser.id);
                const currentCount = s.participants?.length || 0;
                const capacityPct = Math.min((currentCount / s.capacity) * 100, 100);
                
                // Couleur de la barre : Vert (peu), Jaune (moyen), Rouge (plein)
                let progressColor = 'bg-success';
                if (capacityPct > 50) progressColor = 'bg-warning';
                if (capacityPct > 80) progressColor = 'bg-danger';

                const dateObj = new Date(s.dateTime);

                return (
                  <tr key={s._id} className="bg-white shadow-sm rounded-3" style={{transform: 'scale(1)'}}>
                    <td className="ps-3 py-3 border-0 rounded-start">
                      <div className="d-flex align-items-center">
                        <div className={`rounded-circle d-flex align-items-center justify-content-center me-3 ${hasJoined ? 'bg-primary text-white' : 'bg-light text-secondary'}`} style={{width:'40px', height:'40px'}}>
                           <span className="fw-bold small">{s.name.charAt(0).toUpperCase()}</span>
                        </div>
                        <div>
                          <div className="fw-bold text-dark">{s.name}</div>
                          {hasJoined && <span className="badge bg-primary text-white" style={{fontSize: '0.6rem'}}>JOINED</span>}
                        </div>
                      </div>
                    </td>
                    
                    <td className="border-0">
                      <span className="badge rounded-pill bg-light text-dark border px-3 py-2 fw-normal">
                        {s.subject}
                      </span>
                    </td>

                    <td className="text-center border-0">
                      <div className="fw-bold text-dark">{dateObj.toLocaleDateString()}</div>
                      <div className="small text-muted">{dateObj.toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}</div>
                    </td>

                    <td className="border-0">
                      <div className="d-flex align-items-center mb-1">
                        <IconPeople />
                        <span className="ms-2 small fw-bold">{currentCount} / {s.capacity}</span>
                      </div>
                      <div className="progress" style={{height: '6px', borderRadius: '10px'}}>
                        <div className={`progress-bar ${progressColor}`} role="progressbar" style={{width: `${capacityPct}%`}}></div>
                      </div>
                    </td>

                    <td className="text-end pe-3 border-0 rounded-end">
                      <button onClick={() => handleJoinToggle(s)} 
                        className={`btn btn-sm fw-bold me-2 rounded-pill px-3 ${hasJoined ? 'btn-outline-danger' : 'btn-outline-primary'}`}>
                        {hasJoined ? 'Leave' : 'Join'}
                      </button>
                      
                      <button onClick={() => openModal(s)} className="btn btn-sm btn-light text-secondary rounded-circle p-2 me-1" title="Edit">
                        <IconEdit />
                      </button>
                      
                      {isAdmin && (
                        <button onClick={() => del(s._id)} className="btn btn-sm btn-light text-danger rounded-circle p-2" title="Delete">
                          <IconTrash />
                        </button>
                      )}
                    </td>
                  </tr>
                )
              })}
            </tbody>
          </table>
        </div>
      </div>

      {/* --- MODALE --- */}
      {showModal && (
        <div className="modal show d-block" style={{backgroundColor: 'rgba(0,0,0,0.5)', backdropFilter: 'blur(2px)'}}>
          <div className="modal-dialog modal-dialog-centered">
            <div className="modal-content border-0 shadow-lg">
              <div className="modal-header border-bottom-0 pb-0">
                <h5 className="modal-title fw-bold">{editing ? 'Edit Session' : 'Create New Session'}</h5>
                <button onClick={() => setShowModal(false)} className="btn-close"></button>
              </div>
              <div className="modal-body p-4">
                <div className="mb-3">
                  <label className="small fw-bold text-muted mb-1">TITLE</label>
                  <input className="form-control bg-light border-0" placeholder="Ex: Math Revision" value={form.name || ''} onChange={e => setForm({...form, name: e.target.value})} />
                </div>
                
                <div className="mb-3">
                  <label className="small fw-bold text-muted mb-1">SUBJECT</label>
                  <input className="form-control bg-light border-0" placeholder="Ex: Calculus" value={form.subject || ''} onChange={e => setForm({...form, subject: e.target.value})} />
                </div>
                
                <div className="row g-3 mb-3">
                  <div className="col">
                    <label className="small fw-bold text-muted mb-1">DATE</label>
                    <input type="date" className="form-control bg-light border-0" value={form.date || ''} onChange={e => setForm({...form, date: e.target.value})} />
                  </div>
                  <div className="col">
                    <label className="small fw-bold text-muted mb-1">TIME</label>
                    <input type="time" className="form-control bg-light border-0" value={form.time || ''} onChange={e => setForm({...form, time: e.target.value})} />
                  </div>
                </div>

                <div>
                  <label className="small fw-bold text-muted mb-1">CAPACITY</label>
                  <input type="number" className="form-control bg-light border-0" value={form.capacity || ''} onChange={e => setForm({...form, capacity: e.target.value})} />
                </div>
              </div>
              <div className="modal-footer border-top-0 pt-0 pe-4 pb-4">
                <button onClick={() => setShowModal(false)} className="btn btn-link text-muted text-decoration-none me-2">Cancel</button>
                <button onClick={save} className="btn btn-primary px-4 rounded-pill fw-bold">Save Changes</button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}