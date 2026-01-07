import { Tab } from 'react-bootstrap'

export default function TabContent({ title, data, children }) {
  return (
    <Tab eventKey={title} title={title}>
      {data.length === 0 ? (
        <p className="text-muted mt-3">
          No {title.toLowerCase()} items
        </p>
      ) : (
        children(data)
      )}
    </Tab>
  )
}