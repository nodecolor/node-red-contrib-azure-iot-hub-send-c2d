# node-red-contrib-azure-iot-hub-send-c2d 
node-red-contrib-azure-iot-hub-send-c2d  is a node-red node that allows you to send *cloud to device* with Azure IoT Hub.

If you need nodes to receive messages or to send messages *as a device*, check out the package **node-red-contrib-azure-iot-hub**

## Example

```
[{"id":"21f87080.8048f","type":"function","z":"1861b9bb.0b5746","name":"Prepare message","func":"msg.payload = \"test\";\nmsg.deviceId = \"oneDeviceId\";\nreturn msg;","outputs":1,"noerr":0,"x":330,"y":740,"wires":[["f5ca9d76.ae562"]]},{"id":"e315d91b.b431f8","type":"inject","z":"1861b9bb.0b5746","name":"Trigger send","topic":"","payload":"","payloadType":"str","repeat":"","crontab":"","once":false,"onceDelay":0.1,"x":130,"y":740,"wires":[["21f87080.8048f"]]},{"id":"f5ca9d76.ae562","type":"sendc2dmessage","z":"1861b9bb.0b5746","deviceId":"","name":"Azure IoT Hub C2d Sender","x":580,"y":740,"wires":[["767bd710.4bdf28"]]},{"id":"767bd710.4bdf28","type":"debug","z":"1861b9bb.0b5746","name":"","active":true,"tosidebar":true,"console":false,"tostatus":false,"complete":"payload","targetType":"msg","x":810,"y":740,"wires":[]}]
```


## Usage
This node just connect to the IoT Hub and send the message to a specified device. The node will send *msg.payload* to the device with id as *msg.deviceId*.

You also need a connectionString, which is used to connect and authenticate to the IoT HUB. 
This value can be found in the Azure IoT portal. Go to services > shared access policies and pick one entry connection string (or create an entry). Be sure the entry has the serviceConnect permission.
