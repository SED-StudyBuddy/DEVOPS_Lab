import Tab from 'react-bootstrap/Tab'
import Tabs from 'react-bootstrap/Tabs'

// Import des tableaux qui sont dans le dossier components
import RoomsTable from '../components/rooms-table'
import ReservationsTable from '../components/reservations-table'
import UsersTable from '../components/users-table'

// CORRECTION ICI :
// On importe le fichier Sessions.jsx qui est dans le même dossier (pages)
// On le renomme "AdminSessions" pour que ce soit clair dans le code
import AdminSessions from './Sessions'

export default function AdminPage () {
  return (
    <>
      <h3>Admin Page</h3>
      <Tabs
        defaultActiveKey="users"
        id="fill-tab-example"
        className="mb-3"
        fill
      >
        <Tab eventKey="users" title="Users">
          <UsersTable />
        </Tab>

        <Tab eventKey="sessions" title="Study Sessions">
           {/* Ici on affiche le contenu de ton fichier Sessions.jsx */}
          <AdminSessions />
        </Tab>

        <Tab eventKey="rooms" title="Study Rooms">
          <RoomsTable />
        </Tab>

        <Tab eventKey="reservations" title="Room Reservations">
          <ReservationsTable />
        </Tab>
      </Tabs>
    </>
  )
}