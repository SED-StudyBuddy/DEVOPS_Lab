const reservations = [
  { id: 1, roomId: 1, user: 'Alice', date: '2024-07-01', startTime: '10:00', endTIme: '11:00' },
  { id: 2, roomId: 2, user: 'Bob', date: '2024-07-01', startTIme: '11:00', endTIme: '12:00' }
]
export { reservations }

const studyRooms = [
  { id: 1, name: 'Study Room A', capacity: 4, available: true, equipment: ['Whiteboard', 'Projector'] },
  { id: 2, name: 'Study Room B', capacity: 6, available: false, equipment: ['TV', 'Conference Phone'] },
  { id: 3, name: 'Study Room C', capacity: 2, available: true, equipment: ['Bookshelf'] }
]
export { studyRooms }
