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
      <Rosconnection rosUrl="ws://192.168.8.50:9090" rosDomainId="1" setRos={setRos} />
      <div>
        <h4>ROS bridge: <input type="text" value="127.0.0.1" /> </h4>
      </div>

      <h4>Connection: <span id="status">N/A</span></h4>
      {ros &&
        <>
          <Row>
            <KincoMotor 
              ros={ros} 
              namespace={"expansion"} 
              maxRpm={10000} 
              nodeId={1} 
              PNames={["Collapse", "Expand"]}
              Points={[0x0, 0x5fffff]} 
            />
          </Row>
          
          <Row>
            <KincoMotor 
              ros={ros} 
              namespace={"push_pull"} 
              maxRpm={30000} 
              nodeId={2} 
              PNames={["Point 1", "Point 2"]}
              Points={[0x0, 0x1ffffff]}
            />
          </Row>

          <Row>
            <KincoMotor 
              ros={ros} 
              namespace={"rotation"} 
              maxRpm={10000} 
              nodeId={3} 
              PNames={["Left", "Front", "Right"]}
              Points={[0x295f00, 0x14a000, 0x0]
            }/>
          </Row>

          <Row>
            <ZdMotor ros={ros} namespace={"rolling"} maxRpm={600} nodeId={4} />
          </Row>
        </>
      }
    </>
  )
}

export default App
