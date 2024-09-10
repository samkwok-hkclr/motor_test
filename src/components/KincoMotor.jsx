import React, { useEffect, useState } from 'react';
import ROSLIB from 'roslib';

import { Button, Form } from 'react-bootstrap';
import Card from 'react-bootstrap/Card';

const KincoMotor = ({ ros, namespace, maxRpm, nodeId, PNames, Points}) => {
  const [CanReqPublisher, setCanReqPublisher] = useState(null);
  const [RotateDirReqPublisher, setRotateDirReqPublisher] = useState(null);
  const [ModeReqPublisher, setModeReqPublisher] = useState(null);
  const [SpeedReqPublisher, setSpeedReqPublisher] = useState(null);
  const [TargetPosReqPublisher, setTargetPosReqPublisher] = useState(null);
  const [ControlwordReqPublisher, setControlwordReqPublisher] = useState(null);

  const [motorStateData, setMotorStateData] = useState({            
    heartbeatTimestamp: 0,
    statusword: 0,
    actualPosition: 0,
    actualSpeed: 0,
    actualCurrent: 0,
    operationMode: 0,
    controlword: 0}
  );

  useEffect(() => {
    if (!ros) {
      return;
    }

    const canReq = new ROSLIB.Topic({
      ros: ros,
      name: '/can_req',
      messageType: 'can_interfaces/msg/VciCanObj',
    });

    setCanReqPublisher(canReq);

    return () => {
      canReq.unadvertise();
      setCanReqPublisher(null);
    };
  }, [ros]);

  useEffect(() => {
    if (!ros) {
      return;
    }

    const ratateDirReq = new ROSLIB.Topic({
      ros: ros,
      name: namespace + '/rotate_dir_req',
      messageType: 'std_msgs/msg/UInt8',
    });

    setRotateDirReqPublisher(ratateDirReq);

    return () => {
      ratateDirReq.unadvertise();
      setRotateDirReqPublisher(null);
    };
  }, [ros]);

  useEffect(() => {
    if (!ros) {
      return;
    }

    const modeReq = new ROSLIB.Topic({
      ros: ros,
      name: namespace + '/mode_req',
      messageType: 'std_msgs/msg/Int8',
    });

    setModeReqPublisher(modeReq);

    return () => {
      modeReq.unadvertise();
      setModeReqPublisher(null);
    };
  }, [ros]);

  useEffect(() => {
    if (!ros) {
      return;
    }

    const speedReq = new ROSLIB.Topic({
      ros: ros,
      name: namespace + '/speed_req',
      messageType: 'std_msgs/msg/UInt16',
    });

    setSpeedReqPublisher(speedReq);

    return () => {
      speedReq.unadvertise();
      setSpeedReqPublisher(null);
    };
  }, [ros]);

  useEffect(() => {
    if (!ros) {
      return;
    }

    const controlwordReq = new ROSLIB.Topic({
      ros: ros,
      name: namespace + '/controlword_req',
      messageType: 'std_msgs/msg/UInt16',
    });

    setControlwordReqPublisher(controlwordReq);

    return () => {
      controlwordReq.unadvertise();
      setControlwordReqPublisher(null);
    };
  }, [ros]);

  useEffect(() => {
    if (!ros) {
      return;
    }
      
    const targetPosReq = new ROSLIB.Topic({
      ros: ros,
      name: namespace + '/target_pos_req',
      messageType: 'std_msgs/msg/Int32',
    });

    setTargetPosReqPublisher(targetPosReq);

    return () => {
      targetPosReq.unadvertise();
      setTargetPosReqPublisher(null);
    };
  }, [ros]);

  useEffect(() => {
    if (!ros) {
        return;
      }
      
    var motorStateTopic = new ROSLIB.Topic({
        ros: ros,
        name: namespace + '/motor_state',
        messageType: 'kinco_interfaces/msg/KincoState'
    });

    motorStateTopic.subscribe((message) => {
        setMotorStateData(() => {
          const newData = {
            heartbeatTimestamp: message.heartbeat_timestamp,
            statusword: message.statusword,
            actualPosition: message.actual_position,
            actualSpeed: message.actual_speed,
            actualCurrent: message.actual_current,
            operationMode: message.operation_mode,
            controlword: message.controlword,
          };
          return newData;
        });
    });
  
  });
  
  const sendRotateDirReq = (dir) => {
    const msg = new ROSLIB.Message({
      data: dir
    });

    RotateDirReqPublisher.publish(msg);
  };

  const sendModeReq = (mode) => {
    const msg = new ROSLIB.Message({
      data: mode
    });

    ModeReqPublisher.publish(msg);
  };

  const sendSpeedReq = (speed) => {
    const msg = new ROSLIB.Message({
      data: speed
    });

    SpeedReqPublisher.publish(msg);
  };

  const sendTargetPosReq = (targetPos) => {
    const msg = new ROSLIB.Message({
      data: targetPos
    });

    TargetPosReqPublisher.publish(msg);
  };

  const sendControlwordReq = (controlword) => {
    const msg = new ROSLIB.Message({
      data: controlword
    });

    ControlwordReqPublisher.publish(msg);
  };

  const convertRpm2Dec = (rpm) => {
    const dec_10 = Math.floor(512 * rpm * 10000 / 1875);
    const hexString = dec_10.toString(16).padStart(8, '0');

    // Split the hexadecimal string into 4 bytes and convert them to a numeric array
    return [
      parseInt(hexString.slice(6, 8), 16),
      parseInt(hexString.slice(4, 6), 16),
      parseInt(hexString.slice(2, 4), 16),
      parseInt(hexString.slice(0, 2), 16),
    ];
  };

  const sendCanReq = (id, len, data) => {
    const canMsg = new ROSLIB.Message({
      id: id,
      time_stamp: 0,
      time_flag: 0,
      send_type: 0,
      remote_flag: 0,
      extern_flag: 0,
      data_len: len,
      data: data,
      reserved: [0, 0, 0]
    });

    CanReqPublisher.publish(canMsg);
  };

  const [velSliderValue, setVelSliderValue] = useState(0);

  const handleVelSliderChange = (event) => {
    setVelSliderValue(event.target.value);
    console.log(parseInt(event.target.value))
    sendSpeedReq(parseInt(event.target.value));
  };

  return (
    <>
    <Card className="mb-4" style={{ width: '48rem' }}>
      <Card.Body>
        <Card.Text>
          <p>
            <div>
              Heartbeat: {motorStateData.heartbeatTimestamp}
            </div>
            <div>
              Statusword: 0x{motorStateData.statusword.toString(16)}
            </div>
            <div>
              Actual Position: 0x{motorStateData.actualPosition.toString(16)}
            </div>
            <div>
              Actual Speed: {motorStateData.actualSpeed.toFixed(0)}
            </div>
            <div>
              Actual current: {motorStateData.actualCurrent.toFixed(2)},
            </div>
            <div>
              Operation Mode: 0x{motorStateData.operationMode.toString(16)},
            </div>
            <div>
              Controlword: 0x{motorStateData.controlword.toString(16)}
            </div>
          </p>
        </Card.Text>
        
        <Card.Text>
          <Form.Group className="mb-2" controlId="slider">
            <Form.Label>Velocity: </Form.Label>
            <Form.Control type="range" min="-1" max={maxRpm} step={maxRpm/100} value={velSliderValue} onChange={handleVelSliderChange} />
          </Form.Group>
        </Card.Text>
          {/* <Button variant="outline-secondary" onClick={() => sendCanReq(0x600+nodeId, 8, [0x2B, 0x17, 0x10, 0x0, 0xE8, 0x03, 0x0, 0x0])}>
            Heartbeat
          </Button> */}
        <div>
          <Button variant="outline-secondary" onClick={() => sendCanReq(0x0, 2, [0x81, nodeId])}>
            Reset
          </Button>
          <Button variant="outline-secondary" onClick={() => sendCanReq(0x0, 2, [0x01, nodeId])}>
            Operational Mode
          </Button>
          <Button variant="outline-secondary" onClick={() => sendControlwordReq(0x86)}>
            Clear Error
          </Button>
          <Button variant="outline-secondary" onClick={() => sendControlwordReq(0x6)}>
            Stop
          </Button>
        </div>

        <div>
          <Button variant="outline-secondary" onClick={() => sendModeReq(-3)}>
            Velocity Mode
          </Button>
          <Button variant="outline-secondary" onClick={() => sendRotateDirReq(1)}>
            Forward
          </Button>
          <Button variant="outline-secondary" onClick={() => sendRotateDirReq(0)}>
            Backward
          </Button>
          <Button variant="outline-secondary" onClick={() => sendControlwordReq(0x0f)}>
            Start
          </Button>
        </div>

        <div>
          <Button variant="outline-secondary" onClick={() => sendModeReq(1)}>
            Position Mode
          </Button>
          <Button variant="outline-secondary" onClick={() => sendControlwordReq(0x103f)}>
            103f
          </Button>
          {Points.map((point, index) => (
            <Button
              key={index}
              variant="outline-secondary"
              onClick={() => sendTargetPosReq(point)}>
              {PNames[index]}
            </Button>
          ))}
        </div>

      </Card.Body>
    </Card>
    </>
  );
};

export default KincoMotor
