import Tabs from 'react-bootstrap/Tabs'
import Tab from 'react-bootstrap/Tab'

export default function TimeTabs() {
  return (
    <Tabs defaultActiveKey="Upcoming" className="mb-3">
      <Tab eventKey="Upcoming" title="Upcoming">
      </Tab>

      <Tab eventKey="Past" title="Past">
      </Tab>
    </Tabs>
  )
}
