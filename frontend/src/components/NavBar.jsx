import { Link } from 'react-router-dom';
import Button from 'react-bootstrap/Button';
import Container from 'react-bootstrap/Container';
import Form from 'react-bootstrap/Form';
import Nav from 'react-bootstrap/Nav';
import Navbar from 'react-bootstrap/Navbar';
import NavDropdown from 'react-bootstrap/NavDropdown';

export default function NavBar() {
    return (
    <Navbar expand="lg" className="bg-body-tertiary" data-bs-theme="dark">
      <Container className='m-1'>
        <Navbar.Brand as={Link} to="/">StudyBuddy</Navbar.Brand>
        <Navbar.Toggle aria-controls="basic-navbar-nav" />
        <Navbar.Collapse id="basic-navbar-nav">
          <Nav
            className="me-auto my-2 my-lg-0"
            style={{ maxHeight: '100px' }}
            navbarScroll
          >
            <Nav.Link as={Link} to="/sessions">Study Sessions</Nav.Link>
            <Nav.Link as={Link} to="/rooms">Study Rooms</Nav.Link>
            <Nav.Link as={Link} to="/reservations">My Reservations</Nav.Link>
            <Nav.Link as={Link} to="/about">About</Nav.Link>

            <NavDropdown title="My Account" id="navbarScrollingDropdown" className="position-absolute end-0 mx-5">
              <NavDropdown.Item as ={Link} to="/register">
                Sign up
              </NavDropdown.Item>
              <NavDropdown.Item as={Link} to="/login">
                Login
              </NavDropdown.Item>
              <NavDropdown.Item as={Link} to="/profile">
                Profile
              </NavDropdown.Item>
              <NavDropdown.Item as={Link} to="/logout">
                Log Out
              </NavDropdown.Item>
                <NavDropdown.Divider />
                <NavDropdown.Item as={Link} to="/admin">
                Admin
              </NavDropdown.Item>
            </NavDropdown>
          </Nav>
        </Navbar.Collapse>
      </Container>
    </Navbar>
    );
}