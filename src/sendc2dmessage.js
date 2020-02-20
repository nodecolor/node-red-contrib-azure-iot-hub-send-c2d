const uuidv4 = require('uuid/v4');
var Client = require('azure-iothub').Client;
var Message = require('azure-iot-common').Message;

module.exports = function (RED) {

	function sendc2dmessage(config) {

		RED.nodes.createNode(this, config);
		var node = this;
		var ready = false;
		var connectionString = node.credentials.connectionString;
		var deviceId = config.deviceId;
		var reconnectTimeout = null;
		var serviceClient = null;

		// Doh! connection string is not valid. Stop the init & send an error
		if (!connectionString) {
			return node.error("Missing connectionString");
		}

		var cleanServiceClient = () => {
			if (serviceClient) {
				ready = false;
				serviceClient.removeAllListeners();
				serviceClient.close((err, res) => { });
				serviceClient = null;
			}
		}

		var disconnectHandler = () => {
			cleanServiceClient();
			node.status({ fill: "red", shape: "ring", text: "Disconnected" });
		}

		var connect = () => {
			if (reconnectTimeout) clearTimeout(reconnectTimeout);
			cleanServiceClient();
			serviceClient = Client.fromConnectionString(connectionString);
			serviceClient.open(function (err) {
				if (err) {
					node.error('Could not connect: ' + err.message);
					node.status({ fill: "red", shape: "ring", text: "Connection error" });
					ready = false;
				} else {
					ready = true;
					node.status({ fill: "green", shape: "ring", text: "Connected" });
					serviceClient.on('disconnect', function () {
						disconnectHandler(node);
						reconnectTimeout = setTimeout(connect, 4000);
					});
				}
			});
		}

		// connect on node startup
		connect();


		node.on("input", function (msg) {

			// Message is sent only in the case the node is up&runnign
			if (serviceClient && ready) {
				//setup message
				var message = new Message(msg.payload);
				message.ack = 'full';
				message.messageId = uuidv4();

				node.status({ fill: "yellow", shape: "ring", text: "Sending" });
				serviceClient.send(msg.deviceId || deviceId, msg.payload, (error, result) => {

					// set the correct status and send out a coherent message for evary case

					if (error){
						node.status({ fill: "red", shape: "ring", text: "Error" });
						return node.send({ payload: { error: error, source: msg } });	
					}

					if (result){
						node.status({ fill: "green", shape: "ring", text: "Sent" });
						return node.send({ payload: { result: result.constructor.name, source: msg } });
					}

					node.status({ fill: "red", shape: "ring", text: "Error" });
					return node.send({ payload: { error: 'Unknown result', source: msg } });
				});
				return;
			}

			// notify the user if the node is not ready 
			if (!serviceClient) {
				node.status({ fill: "red", shape: "ring", text: "Not initialized" });
				return node.error('Iot service client not initialized');
			}
			if (!ready) {
				node.status({ fill: "red", shape: "ring", text: "Not ready" });
				return node.error('Iot service client not ready');
			}
		});

		node.on('close', function () {
			disconnectHandler();
		});
	};

	RED.nodes.registerType("sendc2dmessage", sendc2dmessage,
		{
			credentials: {
				connectionString: { type: "text" }
			}
		}
	);
}
