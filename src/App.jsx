import { useState } from 'react'
import reactLogo from './assets/react.svg'
import viteLogo from '/vite.svg'

import Rosconnection from './components/RosConnection';
import KincoMotor from './components/KincoMotor';
import ZdMotor from './components/ZdMotor';

import { Row, Col } from 'react-bootstrap';
import './App.css'

function App() {
  const [ros, setRos] = useState(null);

  return (
    <>
      <Rosconnection rosUrl="ws://127.0.0.1:9090" rosDomainId="1" setRos={setRos} />
      <h3>Connection: <span id="status">N/A</span></h3>
      {ros &&
        <>
        <Row>
          <KincoMotor ros={ros} namespace={"rotation"} nodeId={1} />
        </Row>

        <Row>
          <KincoMotor ros={ros} namespace={"expansion"} nodeId={2} />
        </Row>

        <Row>
          <KincoMotor ros={ros} namespace={"push_pull"} nodeId={3} />
        </Row>

        <Row>
          <ZdMotor ros={ros} namespace={"rolling"} nodeId={4} />
        </Row>
        </>
      }
    </>
  )
}

export default App
