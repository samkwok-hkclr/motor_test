import React, { useEffect, useState } from 'react';
import ROSLIB from 'roslib';

import { Button, Form } from 'react-bootstrap';
import Card from 'react-bootstrap/Card';

const KincoMotor = ({ ros, nodeId}) => {
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
    handleRpmChange(velSliderValue);
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
            <Form.Label>Velocity Control</Form.Label>
            <Form.Control type="range" min="-1" max="3000" step="10" value={velSliderValue} onChange={handleVelSliderChange} />
          </Form.Group>
          <Button variant="outline-secondary" onClick={() => sendCanReq(0x600+nodeId, 8, [0x2B, 0x17, 0x10, 0x0, 0xE8, 0x03, 0x0, 0x0])}>
            Heartbeat
          </Button>
          <Button variant="outline-secondary" onClick={() => sendCanReq(0x0, 2, [0x81, 0x01, 0, 0, 0, 0, 0, 0])}>
            Reset
          </Button>
          <Button variant="outline-secondary" onClick={() => sendCanReq(0x0, 8, [0x01, nodeId, 0x0, 0x0, 0x0, 0x0, 0x0, 0x0])}>
            Operational Mode
          </Button>
          <Button variant="outline-secondary" onClick={() => sendCanReq(0x600+nodeId, 8, [0x2F, 0x60, 0x60, 0x0, 0x03, 0x0, 0x0, 0x0])}>
            Enable Velocity Control
          </Button>
          {/* <Button variant="outline-secondary" onClick={() => handleRpmClick()}>
            Set RPM
          </Button> */}
          <Button variant="outline-secondary" onClick={() => sendCanReq(0x600+nodeId, 8, [0x2B, 0x40, 0x60, 0x0, 0x0F, 0x0, 0x0, 0x0])}>
            Enable
          </Button>
          <Button variant="outline-secondary" onClick={() => sendCanReq(0x600+nodeId, 8, [0x2B, 0x40, 0x60, 0x0, 0x06, 0x0, 0x0, 0x0])}>
            Disable
          </Button>
          <Button variant="outline-secondary" onClick={() => sendCanReq(0x600+nodeId, 8, [0x2B, 0x40, 0x60, 0x0, 0x86, 0x0, 0x0, 0x0])}>
            Clear Error
          </Button>
        </Card.Text>
      </Card.Body>
    </Card>
    </>
  );
};

export default KincoMotor
