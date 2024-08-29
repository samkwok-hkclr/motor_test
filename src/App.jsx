import { useState } from 'react'

import Rosconnection from './components/RosConnection';
import KincoMotor from './components/KincoMotor';
import ZdMotor from './components/ZdMotor';

import { Row, Col } from 'react-bootstrap';
import './App.css'

function App() {
  const [ros, setRos] = useState(null);

  return (
    <>
      <Rosconnection rosUrl="ws://192.168.50.160:9090" rosDomainId="1" setRos={setRos} />
      <div>
        <h4>ROS bridge: <input type="text" value="127.0.0.1" /> </h4>
      </div>

      <h4>Connection: <span id="status">N/A</span></h4>
      {ros &&
        <>
          <Row>
            <KincoMotor ros={ros} namespace={"expansion"} maxRpm={6000} nodeId={1} />
          </Row>
          
          <Row>
            <KincoMotor ros={ros} namespace={"push_pull"} maxRpm={15000} nodeId={2} />
          </Row>

          <Row>
            <KincoMotor ros={ros} namespace={"rotation"} maxRpm={300} nodeId={3} />
          </Row>

          <Row>
            <ZdMotor ros={ros} namespace={"rolling"} maxRpm={300} nodeId={4} />
          </Row>
        </>
      }
    </>
  )
}

export default App
