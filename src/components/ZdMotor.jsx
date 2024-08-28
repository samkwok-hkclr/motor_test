import React, { useEffect, useState } from 'react';
import ROSLIB from 'roslib';

import { Button, Form } from 'react-bootstrap';
import Card from 'react-bootstrap/Card';

const ZdMotor = ({ ros, namespace, maxRpm, nodeId}) => {
  const [CanReqPublisher, setCanReqPublisher] = useState(null);

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

  const convertRpm2Dec = (rpm) => {
    const hexString = rpm.toString(16).padStart(4, '0');
    // Split the hexadecimal string into 4 bytes and convert them to a numeric array
    return [
      parseInt(hexString.slice(0, 2), 16),
      parseInt(hexString.slice(2, 4), 16),
      0x0,
      0x0,
      0x0
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
    handleRpmChange(velSliderValue);
  };

  const handleRpmChange = () => {
    const arr_1 = [0x06, 0x20, 0x01];
    const arr_2 = convertRpm2Dec(velSliderValue);
    // const arr_2 = [0x0B, 0xB0, 0x0, 0x0, 0x0];
    console.log([...arr_1, ...arr_2]);
    sendCanReq(0x700+nodeId, 8, [...arr_1, ...arr_2]);
  };

  return (
    <>
    <Card className="mb-4" style={{ width: '48rem' }}>
      <Card.Body>
        <Card.Text>
          <Form.Group className="mb-2" controlId="slider">
            <Form.Label>Velocity: </Form.Label>
            <Form.Control type="range" min="0" max={maxRpm} step={maxRpm/100} value={velSliderValue} onChange={handleVelSliderChange} />
          </Form.Group>
          {/* <Button variant="outline-secondary" onClick={() => sendCanReq(0x700+nodeId, 8, [0x2B, 0x17, 0x10, 0x0, 0xE8, 0x03, 0x0, 0x0])}>
            Heartbeat
          </Button> */}
          <Button variant="outline-secondary" onClick={() => sendCanReq(0x700+nodeId, 8, [0x06, 0x20, 0x00, 0x0, 0x01, 0, 0, 0])}>
            Forward
          </Button>
          <Button variant="outline-secondary" onClick={() => sendCanReq(0x700+nodeId, 8, [0x06, 0x20, 0x00, 0x0, 0x02, 0, 0, 0])}>
            Backward
          </Button>
          <Button variant="outline-secondary" onClick={() => sendCanReq(0x700+nodeId, 8, [0x06, 0x20, 0x00, 0x0, 0x05, 0, 0 , 0])}>
            Disable
          </Button>
          <Button variant="outline-secondary" onClick={() => sendCanReq(0x700+nodeId, 8, [0x06, 0x20, 0x00, 0x0, 0x07, 0, 0, 0])}>
            Clear Error
          </Button>
        </Card.Text>
      </Card.Body>
    </Card>
    </>
  );
};

export default ZdMotor
