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
import AdminRoute from './components/AdminRoute'
import LoggedUserRoute from './components/LoggedUserRoute.jsx'

export default function App () {
  return (
      <><NavBar /><Routes>
      <Route path="/" element={<HomePage />} />
      <Route path="/sessions" element={<LoggedUserRoute><SessionsPage /></LoggedUserRoute>} />
      <Route path="/rooms" element={<LoggedUserRoute><RoomsPage /></LoggedUserRoute>} />
      <Route path="/profile" element={<LoggedUserRoute><ProfilePage /></LoggedUserRoute>} />
      <Route path="/about" element={<AboutPage />} />
      <Route path="/admin" element={<AdminRoute><AdminPage /></AdminRoute>}/>
      <Route path="/my-sessions" element={<LoggedUserRoute><MySessionsPage /></LoggedUserRoute>} />
      <Route path="/register" element={<RegistrationPage />} />
      <Route path="/login" element={<LoginPage />} />
    </Routes></>
  )
}
