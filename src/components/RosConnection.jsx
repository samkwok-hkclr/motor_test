import React, { useEffect } from 'react';
import ROSLIB from 'roslib';

const Rosconnection = ({ rosUrl, rosDomainId, setRos}) => {

  useEffect(() => {
    // Create ros object to communicate over your Rosbridge connection
    const ros = new ROSLIB.Ros({
      url: rosUrl,
      options: {
        ros_domain_id: rosDomainId // ROS_DOMAIN_ID
      }
    });

    // When the Rosbridge server connects, fill the span with id "status" with "successful"
    ros.on("connection", () => {
      setRos(ros);
      document.getElementById("status").innerHTML = "successful";
      console.log('Connected to ROSBridge WebSocket server.');
    });
  
    // When the Rosbridge server experiences an error, fill the "status" span with the returned error
    ros.on('error', function(error) {
      console.log('Error connecting to ROSBridge WebSocket server: ', error);
    });
  
    // When the Rosbridge server shuts down, fill the "status" span with "closed"
    ros.on('close', function() {
      console.log('Connection to ROSBridge WebSocket server closed.');
    });

    return () => {
      ros.close();
    };
  }, [rosUrl, rosDomainId, setRos]);

  return (
    <>

    </>
  );
}
export default Rosconnection;