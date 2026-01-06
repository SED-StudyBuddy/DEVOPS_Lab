import NavBar from './components/NavBar'
import './App.css'
import { Route, Routes } from 'react-router-dom'
import Home from './pages/Home.jsx'
import Sessions from './pages/Sessions.jsx'
import Rooms from './pages/Rooms.jsx'
import Profile from './pages/Profile.jsx'
import About from './pages/About.jsx'
import Admin from './pages/Admin.jsx'
import Reservations from './pages/Reservations.jsx'

export default function App () {
  return (
      <><NavBar /><Routes>
      <Route path="/" element={<Home />} />
      <Route path="/sessions" element={<Sessions />} />
      <Route path="/rooms" element={<Rooms />} />
      <Route path="/profile" element={<Profile />} />
      <Route path="/about" element={<About />} />
      <Route path="/admin" element={<Admin />} />
      <Route path="/reservations" element={<Reservations />} />
    </Routes></>
  )
}
