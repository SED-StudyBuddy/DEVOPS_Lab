import { Link, useNavigate } from 'react-router-dom'
import Container from 'react-bootstrap/Container'
import Nav from 'react-bootstrap/Nav'
import Navbar from 'react-bootstrap/Navbar'
import NavDropdown from 'react-bootstrap/NavDropdown'
import { getStoredUser, clearAuth } from '../api'
import { useEffect, useState } from 'react'

export default function NavBar () {
  const navigate = useNavigate()
  const [user, setUser] = useState(() => getStoredUser())

  useEffect(() => {
    const syncUser = () => setUser(getStoredUser())
    window.addEventListener('auth-changed', syncUser)
    return () => window.removeEventListener('auth-changed', syncUser)
  }, [])

  function logout () {
    clearAuth()
    navigate('/login')
  }
  const isLoggedIn = !!user
  const isAdmin = user?.role === 'admin'

  return (
    <Navbar expand="lg" bg="dark" variant="dark">
      <Container fluid>
        <Navbar.Brand as={Link} to="/">StudyBuddy</Navbar.Brand>
        <Navbar.Toggle />

        <Navbar.Collapse>
          {/* LEFT */}
          <Nav className="me-auto">
            <Nav.Link as={Link} to="/sessions">Study Sessions</Nav.Link>
            <Nav.Link as={Link} to="/rooms">Study Rooms</Nav.Link>
            <Nav.Link as={Link} to="/my-sessions">My Sessions</Nav.Link>
            <Nav.Link as={Link} to="/about">About</Nav.Link>
          </Nav>

          {/* RIGHT */}
          <Nav className="ms-auto">
            <NavDropdown title="My Account" align="end">
              {!isLoggedIn && (
                <>
                  <NavDropdown.Item as={Link} to="/register">Sign up</NavDropdown.Item>
                  <NavDropdown.Item as={Link} to="/login">Login</NavDropdown.Item>
                </>
              )}

              {isLoggedIn && (
                <>
                  <NavDropdown.Item as={Link} to="/profile">Profile</NavDropdown.Item>
                  <NavDropdown.Item onClick={logout}>Log out</NavDropdown.Item>
                </>
              )}

              {isAdmin && (
                <>
                  <NavDropdown.Divider />
                  <NavDropdown.Item as={Link} to="/admin">Admin</NavDropdown.Item>
                </>
              )}
            </NavDropdown>
          </Nav>
        </Navbar.Collapse>
      </Container>
    </Navbar>
  )
}
