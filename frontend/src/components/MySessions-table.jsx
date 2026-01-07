import { Table, Button, Badge } from 'react-bootstrap'

export default function ReservationTable({ data, onEdit, onCancel, rooms }) {
  return (
    <Table bordered hover responsive>
      <thead>
        <tr>
          <th>Room</th>
          <th>Date</th>
          <th>Time</th>
          <th>Status</th>
          <th>Action</th>
        </tr>
      </thead>
      <tbody>
        {data.map(r => (
          <tr key={r._id}>
            <td>{rooms.find(room => room._id === r.roomId)?.name || 'Unknown Room'}</td>
            <td>{r.date}</td>
            <td>{r.startTime} – {r.endTime}</td>
            <td>
              <Badge bg={
                r.status === 'Scheduled' ? 'primary' :
                r.status === 'Completed' ? 'success' :
                r.status === 'Cancelled' ? 'danger' : 'secondary'
              }>
                {r.status}
              </Badge>
            </td>
            <td>
              {onEdit && (
                <Button
                  size="sm"
                  onClick={() => onEdit(r)}
                  className="me-2"
                >
                  Edit
                </Button>
              )}
              {onCancel && (
                <Button
                  size="sm"
                  variant="danger"
                  onClick={() => onCancel(r._id)}
                >
                  Cancel Reservation
                </Button>
              )}
            </td>
          </tr>
        ))}
      </tbody>
    </Table>
  )
}
