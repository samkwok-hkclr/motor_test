import React, { useEffect, useState } from 'react';
import ROSLIB from 'roslib';

import { Button, Form } from 'react-bootstrap';
import Card from 'react-bootstrap/Card';

const KincoMotor = ({ ros, namespace, maxRpm, nodeId}) => {
  const [CanReqPublisher, setCanReqPublisher] = useState(null);
  const [RotateDirReqPublisher, setRotateDirReqPublisher] = useState(null);
  const [ModeReqPublisher, setModeReqPublisher] = useState(null);
  const [SpeedReqPublisher, setSpeedReqPublisher] = useState(null);
  const [ControlwordReqPublisher, setControlwordReqPublisher] = useState(null);

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
      messageType: 'std_msgs/msg/UInt16',
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

  const handleRpmChange = () => {
    const arr_1 = [0x23, 0xFF, 0x60, 0x0];
    const arr_2 = convertRpm2Dec(velSliderValue);
    console.log(velSliderValue);
    sendCanReq(0x600+nodeId, 8, [...arr_1, ...arr_2]);
  };

  return (
    <>
    <Card className="mb-4" style={{ width: '48rem' }}>
      <Card.Body>
        <Card.Text>
          <Form.Group className="mb-2" controlId="slider">
            <Form.Label>Velocity: </Form.Label>
            <Form.Control type="range" min="-1" max={maxRpm} step={maxRpm/100} value={velSliderValue} onChange={handleVelSliderChange} />
          </Form.Group>
          {/* <Button variant="outline-secondary" onClick={() => sendCanReq(0x600+nodeId, 8, [0x2B, 0x17, 0x10, 0x0, 0xE8, 0x03, 0x0, 0x0])}>
            Heartbeat
          </Button> */}
          <Button variant="outline-secondary" onClick={() => sendCanReq(0x0, 2, [0x81, nodeId])}>
            Reset
          </Button>
          <Button variant="outline-secondary" onClick={() => sendCanReq(0x0, 2, [0x01, nodeId])}>
            Operational Mode
          </Button>
          <Button variant="outline-secondary" onClick={() => sendModeReq(3)}>
            Set Velocity Mode
          </Button>
          <Button variant="outline-secondary" onClick={() => sendRotateDirReq(1)}>
            Forward
          </Button>
          <Button variant="outline-secondary" onClick={() => sendRotateDirReq(0)}>
            Backward
          </Button>
          <Button variant="outline-secondary" onClick={() => sendControlwordReq(0x0F)}>
            Enable
          </Button>
          <Button variant="outline-secondary" onClick={() => sendControlwordReq(0x06)}>
            Disable
          </Button>
          <Button variant="outline-secondary" onClick={() => sendControlwordReq(0x86)}>
            Clear Error
          </Button>
        </Card.Text>
      </Card.Body>
    </Card>
    </>
  );
};

export default KincoMotor
