import { Table, Badge } from 'react-bootstrap'

export default function Section({ title, items, type }) {
  return (
    <>
      <h4 className="mt-4">{title}</h4>

      {items.length === 0 ? (
        <p className="text-muted">No items</p>
      ) : (
        <Table bordered hover responsive>
          <thead>
            <tr>
              <th>Title</th>
              <th>Date</th>
              <th>Time</th>
              <th>Room</th>
              <th>Status</th>
            </tr>
          </thead>
          <tbody>
            {items.map(item => (
              <tr key={item._id}>
                <td>
                  {type === 'session'
                    ? item.name
                    : 'Room Reservation'}
                </td>
                <td>{item.date}</td>
                <td>
                  {item.startTime} – {item.endTime}
                </td>
                <td>{item.roomName ?? '—'}</td>
                <td>
                  <Badge bg={isFuture(item.date) ? 'success' : 'secondary'}>
                    {isFuture(item.date) ? 'Upcoming' : 'Completed'}
                  </Badge>
                </td>
              </tr>
            ))}
          </tbody>
        </Table>
      )}
    </>
  )
}

const isFuture = date => new Date(date) >= new Date()
