import Tab from 'react-bootstrap/Tab';
import Tabs from 'react-bootstrap/Tabs';
import RoomsTable from '../components/rooms-table';
import ReservationsTable from '../components/reservations-table';

export default function AdminPage() {
  return (
    <>
    <h3>Admin Page</h3>
    <Tabs
      defaultActiveKey="profile"
      id="fill-tab-example"
      className="mb-3"
      fill
    >
      <Tab eventKey="users" title="Users">
        Tab content for Users
      </Tab>
      <Tab eventKey="sessions" title="Study Sessions">
        Tab content for Study Sessions
      </Tab>
      <Tab eventKey="rooms" title="Study Rooms">
        <RoomsTable />
      </Tab>
      <Tab eventKey="reservations" title="Room Reservations">
        <ReservationsTable />
      </Tab>
    </Tabs>
    </>
  );
}