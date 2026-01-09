import { useEffect, useState } from 'react'
import { apiFetch } from '../api'

// --- Icones SVG ---
const IconEdit = () => <svg width="16" height="16" fill="currentColor" viewBox="0 0 16 16"><path d="M12.146.146a.5.5 0 0 1 .708 0l3 3a.5.5 0 0 1 0 .708l-10 10a.5.5 0 0 1-.168.11l-5 2a.5.5 0 0 1-.65-.65l2-5a.5.5 0 0 1 .11-.168l10-10zM11.207 2.5 13.5 4.793 14.793 3.5 12.5 1.207 11.207 2.5zm1.586 3L10.5 3.207 4 9.707V10h.5a.5.5 0 0 1 .5.5v.5h.5a.5.5 0 0 1 .5.5v.5h.293l6.5-6.5zm-9.761 5.175-.106.106-1.528 3.821 3.821-1.528.106-.106A.5.5 0 0 1 5 12.5V12h-.5a.5.5 0 0 1-.5-.5V11h-.5a.5.5 0 0 1-.468-.325z"/></svg>;
const IconTrash = () => <svg width="16" height="16" fill="currentColor" viewBox="0 0 16 16"><path d="M5.5 5.5A.5.5 0 0 1 6 6v6a.5.5 0 0 1-1 0V6a.5.5 0 0 1 .5-.5zm2.5 0a.5.5 0 0 1 .5.5v6a.5.5 0 0 1-1 0V6a.5.5 0 0 1 .5-.5zm3 .5a.5.5 0 0 0-1 0v6a.5.5 0 0 0 1 0V6z"/><path fillRule="evenodd" d="M14.5 3a1 1 0 0 1-1 1H13v9a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V4h-.5a1 1 0 0 1-1-1V2a1 1 0 0 1 1-1H6a1 1 0 0 1 1-1h2a1 1 0 0 1 1 1h3.5a1 1 0 0 1 1 1v1zM4.118 4 4 4.059V13a1 1 0 0 0 1 1h6a1 1 0 0 0 1-1V4.059L11.882 4H4.118zM2.5 3V2h11v1h-11z"/></svg>;
const IconPeople = () => <svg width="16" height="16" fill="currentColor" viewBox="0 0 16 16"><path d="M7 14s-1 0-1-1 1-4 5-4 5 3 5 4-1 1-1 1H7zm4-6a3 3 0 1 0 0-6 3 3 0 0 0 0 6z"/><path fillRule="evenodd" d="M5.216 14A2.238 2.238 0 0 1 5 13c0-1.355.68-2.75 1.936-3.72A6.325 6.325 0 0 0 5 9c-4 0-5 3-5 4s1 1 1 1h4.216z"/></svg>;

export default function Sessions() {
  const [sessions, setSessions] = useState([])
  const [rooms, setRooms] = useState([])
  const [reservations, setReservations] = useState([])
  const [loading, setLoading] = useState(false)
  const [currentUser, setCurrentUser] = useState(null)
  const [msg, setMsg] = useState('')
  const [showModal, setShowModal] = useState(false)
  const [editing, setEditing] = useState(null)
  const [form, setForm] = useState({})

  // Vérification du rôle Admin
  const isAdmin = currentUser?.role === 'admin';

  useEffect(() => {
    const authData = localStorage.getItem('auth') || localStorage.getItem('user');
    if (authData) {
      try {
        const parsed = JSON.parse(authData);
        setCurrentUser(parsed.user || parsed);
      } catch (e) { console.error("Auth error", e); }
    }
    loadData();
  }, [])

  const loadData = async () => {
    setLoading(true)
    try {
      const [sessionsData, roomsData, reservationsData] = await Promise.all([
        apiFetch('/api/study-sessions'),
        apiFetch('/api/study-rooms').catch(() => []),
        apiFetch('/api/reservations').catch(() => []) 
      ]);
      setSessions(sessionsData);
      setRooms(roomsData);
      setReservations(reservationsData);
    } catch (e) { setMsg('Error loading data'); }
    setLoading(false)
  }

  // --- DÉTECTION DE CONFLIT (SESSIONS + RÉSERVATIONS) ---
  const checkRoomConflict = (roomId, dateStr, timeStr, durationMin, currentSessionId) => {
    if (!roomId) return null; 

    const newStart = new Date(`${dateStr}T${timeStr}`);
    const newEnd = new Date(newStart.getTime() + durationMin * 60000);

    // 1. Vérifier conflit avec une autre SESSION
    const sessionConflict = sessions.find(s => {
        if (currentSessionId && s._id === currentSessionId) return false;
        const sRoomId = s.room?._id || s.room;
        if (sRoomId !== roomId) return false;
        const sStart = new Date(s.dateTime);
        const sEnd = new Date(sStart.getTime() + (s.duration || 60) * 60000);
        return (newStart < sEnd && newEnd > sStart);
    });

    if (sessionConflict) return `Session "${sessionConflict.name}"`;

    // 2. Vérifier conflit avec une RÉSERVATION (Admin)
    const reservationConflict = reservations.find(r => {
        const rRoomId = r.room?._id || r.room;
        if (rRoomId !== roomId) return false;
        if (r.status === 'Cancelled') return false;

        const rStart = new Date(`${r.date.split('T')[0]}T${r.startTime}`);
        const rEnd = new Date(`${r.date.split('T')[0]}T${r.endTime}`);
        return (newStart < rEnd && newEnd > rStart);
    });

    if (reservationConflict) return `Reservation (${reservationConflict.startTime} - ${reservationConflict.endTime})`;

    return null;
  };

  const save = async () => {
    if (!form.name || !form.subject || !form.date || !form.time || !form.ownerId) {
      setMsg('Please fill all required fields');
      return;
    }

    let finalLocation = form.location;
    let finalZoomLink = form.zoomLink;
    let finalRoomId = form.room;
    let finalDuration = parseInt(form.duration) || 60;

    if (form.type === 'virtual') {
        finalLocation = 'Online';
        finalRoomId = null;
        if (!finalZoomLink) { setMsg('Zoom link required for virtual session'); return; }
    } else {
        finalZoomLink = '';
        if (!finalRoomId) { setMsg('Please select a room'); return; }

        // >>> VÉRIFICATION DU CONFLIT <<<
        const conflictReason = checkRoomConflict(finalRoomId, form.date, form.time, finalDuration, editing?._id);
        
        if (conflictReason) {
            // Affiche l'erreur et ARRÊTE TOUT (return)
            setMsg(`Error: Room is already reserved by ${conflictReason}`);
            return; 
        }
    }

    const payload = { 
      ...form, 
      dateTime: `${form.date}T${form.time}`,
      capacity: parseInt(form.capacity) || 10,
      duration: finalDuration,
      public: form.public !== false,
      ownerId: form.ownerId,
      location: finalLocation,
      room: finalRoomId, 
      zoomLink: finalZoomLink
    };

    try {
      const url = editing ? `/api/study-sessions/${editing._id}` : '/api/study-sessions';
      await apiFetch(url, {
        method: editing ? 'PUT' : 'POST',
        body: JSON.stringify(payload)
      });
      setShowModal(false); // Ferme la modale uniquement si succès
      loadData();
      setMsg(editing ? 'Session updated!' : 'Session created successfully!');
    } catch (e) { setMsg('Error saving session'); }
  }

  const del = async (session) => {
    // SÉCURITÉ : Admin OU Propriétaire seulement
    const userId = currentUser?._id || currentUser?.id;
    if (!isAdmin && session.ownerId !== userId) {
        alert("You can only delete your own sessions.");
        return;
    }

    if (!window.confirm('Delete this session?')) return;
    try {
      await apiFetch(`/api/study-sessions/${session._id}`, { method: 'DELETE' });
      loadData();
    } catch (e) { setMsg('Error deleting session'); }
  }

  const handleJoinToggle = async (session) => {
    const userId = currentUser?._id || currentUser?.id;
    if (!userId) return setMsg("Please login to join");
    const isJoined = session.participants?.includes(userId);
    const action = isJoined ? 'leave' : 'join';
    try {
      await apiFetch(`/api/study-sessions/${session._id}/${action}`, {
        method: 'POST',
        body: JSON.stringify({ userId })
      });
      loadData();
    } catch (e) { setMsg("Join/Leave error"); }
  }

  const openModal = (s = null) => {
    setEditing(s);
    setMsg(''); // Reset des messages d'erreur à l'ouverture
    if (s) {
      const d = new Date(s.dateTime);
      setForm({ 
        ...s, 
        date: d.toISOString().split('T')[0], 
        time: d.toTimeString().slice(0, 5),
        duration: s.duration || 60,
        ownerId: s.ownerId || '',
        type: s.type || 'group',
        zoomLink: s.zoomLink || '',
        location: s.location || '',
        room: s.room?._id || s.room || '', 
        description: s.description || '',
        public: s.public !== false
      });
    } else {
      const defaultOwner = currentUser?._id || currentUser?.id || '';
      setForm({ 
        name: '', subject: '', date: '', time: '', 
        capacity: 10, duration: 60, 
        ownerId: defaultOwner, 
        type: 'group', location: '', room: '', zoomLink: '', description: '', public: true 
      });
    }
    setShowModal(true);
  }

  const handleRoomChange = (e) => {
    const roomId = e.target.value;
    const selectedRoom = rooms.find(r => r._id === roomId);
    if (selectedRoom) {
        setForm({ ...form, room: roomId, location: selectedRoom.name });
    } else {
        setForm({ ...form, room: '', location: '' });
    }
  }

  return (
    <div className="p-4 bg-white rounded shadow-sm border">
      <div className="d-flex justify-content-between align-items-center mb-4">
        <div>
          <h4 className="fw-bold mb-1 text-dark">Study Sessions</h4>
          <div className="text-muted small">
            {isAdmin ? 'Admin Panel' : 'Student Dashboard'}
          </div>
        </div>
        <button onClick={() => openModal()} className="btn btn-primary shadow-sm fw-bold px-3">
          + New Session
        </button>
      </div>

      {/* ZONE DE MESSAGE (Rouge si erreur, Bleu si info) */}
      {msg && <div className={`alert py-2 small shadow-sm ${msg.includes('Error') ? 'alert-danger' : 'alert-info'}`}>{msg}</div>}

      <div className="card border-0 shadow-none">
        <div className="table-responsive">
          <table className="table table-hover align-middle">
            <thead className="small text-uppercase text-muted">
              <tr>
                <th className="ps-3">Details</th>
                <th>Loc / Link</th>
                <th className="text-center">Date</th>
                <th>Cap</th>
                <th className="text-end pe-3">Actions</th>
              </tr>
            </thead>
            <tbody>
              {sessions.map(s => {
                const userId = currentUser?._id || currentUser?.id;
                const hasJoined = s.participants?.includes(userId);
                const currentCount = s.participants?.length || 0;
                const dateObj = new Date(s.dateTime);

                // --- PERMISSIONS ---
                const isOwner = s.ownerId === userId;
                const canManage = isAdmin || isOwner;

                return (
                  <tr key={s._id} className="bg-white">
                    <td className="ps-3 fw-bold">
                        {s.name} <br/>
                        <small className="fw-normal text-muted">{s.subject}</small>
                    </td>
                    <td>
                        {s.type === 'virtual' ? (
                             <span className="text-primary small">Zoom/Virtual</span>
                        ) : (
                             <span className="text-dark small">📍 {s.location}</span>
                        )}
                    </td>
                    <td className="text-center">
                        {dateObj.toLocaleDateString()}<br/>
                        <small>{dateObj.toLocaleTimeString([], {hour:'2-digit', minute:'2-digit'})}</small>
                    </td>
                    <td>
                        <div className="d-flex align-items-center">
                            <IconPeople /> <span className="ms-2 small">{currentCount}/{s.capacity}</span>
                        </div>
                    </td>
                    <td className="text-end pe-3">
                      <button onClick={() => handleJoinToggle(s)} className={`btn btn-sm me-2 rounded-pill ${hasJoined ? 'btn-outline-danger' : 'btn-outline-primary'}`}>
                        {hasJoined ? 'Leave' : 'Join'}
                      </button>

                      {/* Visibilité boutons Edit/Delete */}
                      {canManage && (
                          <>
                            <button onClick={() => openModal(s)} className="btn btn-sm btn-light rounded-circle me-1" title="Edit">
                                <IconEdit />
                            </button>
                            <button onClick={() => del(s)} className="btn btn-sm btn-light text-danger rounded-circle" title="Delete">
                                <IconTrash />
                            </button>
                          </>
                      )}
                    </td>
                  </tr>
                )
              })}
            </tbody>
          </table>
        </div>
      </div>

      {/* MODALE */}
      {showModal && (
        <div className="modal show d-block" style={{backgroundColor: 'rgba(0,0,0,0.5)', backdropFilter: 'blur(2px)'}}>
          <div className="modal-dialog modal-dialog-centered modal-lg">
            <div className="modal-content border-0 shadow-lg">
              <div className="modal-header border-bottom-0">
                <h5 className="modal-title fw-bold">{editing ? 'Edit Session' : 'Create Session'}</h5>
                <button onClick={() => setShowModal(false)} className="btn-close"></button>
              </div>
              <div className="modal-body p-4">
                
                <div className="mb-3">
                    <label className="small fw-bold text-danger mb-1">OWNER ID</label>
                    {/* ReadOnly si étudiant */}
                    <input 
                        className={`form-control ${isAdmin ? 'bg-light' : 'bg-white text-muted'} border-danger`} 
                        value={form.ownerId || ''} 
                        onChange={e => setForm({...form, ownerId: e.target.value})} 
                        placeholder="Owner ID required"
                        readOnly={!isAdmin} 
                        title={!isAdmin ? "You cannot change the owner" : ""}
                    />
                </div>

                <div className="row g-3 mb-3">
                    <div className="col-md-6">
                        <label className="small fw-bold text-muted mb-1">TITLE</label>
                        <input className="form-control bg-light border-0" value={form.name || ''} onChange={e => setForm({...form, name: e.target.value})} placeholder="Ex: Math Revision" />
                    </div>
                    <div className="col-md-6">
                        <label className="small fw-bold text-muted mb-1">SUBJECT</label>
                        <input className="form-control bg-light border-0" value={form.subject || ''} onChange={e => setForm({...form, subject: e.target.value})} placeholder="Ex: Calculus" />
                    </div>
                </div>

                <div className="row g-3 mb-3">
                    <div className="col-md-6">
                        <label className="small fw-bold text-muted">TYPE</label>
                        <select className="form-select bg-light border-0" value={form.type || 'group'} onChange={e => setForm({...form, type: e.target.value})}>
                            <option value="group">In Person (Group)</option>
                            <option value="individual">In Person (Individual)</option>
                            <option value="virtual">Virtual (Zoom/Teams)</option>
                        </select>
                    </div>

                    <div className="col-md-6">
                        {form.type === 'virtual' ? (
                             <>
                                <label className="small fw-bold text-primary mb-1">ZOOM LINK</label>
                                <input 
                                    className="form-control bg-light border-primary" 
                                    placeholder="https://zoom.us/..." 
                                    value={form.zoomLink || ''} 
                                    onChange={e => setForm({...form, zoomLink: e.target.value})} 
                                />
                             </>
                        ) : (
                             <>
                                <label className="small fw-bold text-muted mb-1">SELECT ROOM</label>
                                <select 
                                    className="form-select bg-light border-0" 
                                    value={form.room || ''} 
                                    onChange={handleRoomChange}
                                >
                                    <option value="">-- Choose a Room --</option>
                                    {rooms.map(r => (
                                        <option key={r._id} value={r._id}>
                                            {r.name} (Cap: {r.capacity})
                                        </option>
                                    ))}
                                </select>
                             </>
                        )}
                    </div>
                </div>

                <div className="row g-3 mb-3">
                    <div className="col-4">
                        <label className="small fw-bold text-muted">DATE</label>
                        <input type="date" className="form-control bg-light border-0" value={form.date || ''} onChange={e => setForm({...form, date: e.target.value})} />
                    </div>
                    <div className="col-4">
                        <label className="small fw-bold text-muted">TIME</label>
                        <input type="time" className="form-control bg-light border-0" value={form.time || ''} onChange={e => setForm({...form, time: e.target.value})} />
                    </div>
                    <div className="col-4">
                        <label className="small fw-bold text-muted">DURATION (MIN)</label>
                        <input type="number" className="form-control bg-light border-0" value={form.duration || 60} onChange={e => setForm({...form, duration: e.target.value})} />
                    </div>
                </div>

                <div className="mb-3">
                    <label className="small fw-bold text-muted">DESCRIPTION</label>
                    <textarea className="form-control bg-light border-0" rows="2" value={form.description || ''} onChange={e => setForm({...form, description: e.target.value})} />
                </div>

                <div className="d-flex justify-content-between align-items-center">
                    <div className="w-50 me-3">
                        <label className="small fw-bold text-muted">CAPACITY</label>
                        <input type="number" className="form-control bg-light border-0" value={form.capacity || 10} onChange={e => setForm({...form, capacity: e.target.value})} />
                    </div>
                    <div className="form-check form-switch mt-4">
                        <input className="form-check-input" type="checkbox" checked={form.public !== false} onChange={e => setForm({...form, public: e.target.checked})} />
                        <label className="form-check-label text-muted">Public</label>
                    </div>
                </div>

              </div>
              <div className="modal-footer border-top-0">
                <button onClick={() => setShowModal(false)} className="btn btn-link text-muted text-decoration-none">Cancel</button>
                <button onClick={save} className="btn btn-primary rounded-pill fw-bold px-4">{editing ? 'Save' : 'Create'}</button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}