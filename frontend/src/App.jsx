import NavBar from './components/NavBar'
import './App.css'
import { Route, Routes } from 'react-router-dom'
import HomePage from './pages/Home.jsx'
import SessionsPage from './pages/Sessions.jsx'
import RoomsPage from './pages/Rooms.jsx'
import ProfilePage from './pages/Profile.jsx'
import AboutPage from './pages/About.jsx'
import AdminPage from './pages/Admin.jsx'
import MySessionsPage from './pages/MySessions.jsx'
import RegistrationPage from './pages/Registration.jsx'
import LoginPage from './pages/Login.jsx'

export default function App () {
  return (
      <><NavBar /><Routes>
      <Route path="/" element={<HomePage />} />
      <Route path="/sessions" element={<SessionsPage />} />
      <Route path="/rooms" element={<RoomsPage />} />
      <Route path="/profile" element={<ProfilePage />} />
      <Route path="/about" element={<AboutPage />} />
      <Route path="/admin" element={<AdminPage />} />
      <Route path="/my-sessions" element={<MySessionsPage />} />
      <Route path="/register" element={<RegistrationPage />} />
      <Route path="/login" element={<LoginPage />} />
    </Routes></>
  )
}
