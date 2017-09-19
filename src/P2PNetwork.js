/**
 * @author Vladyslav Zaichuk <xinonghost@gmail.com>
 */

'use strict'

var WebSocket = require("ws");

/**
 * Class P2PNetwork
 */
class P2PNetwork
{
	constructor(config)
	{
		this.config = config;

		// P2P server
		this.server = null;

		// Components
		this.components = {};

		// Socket list
		this.sockets = [];
	}

	/**
	 * Init server.
	 */
	start()
	{
		var self = this;

		self.server = new WebSocket.Server({port: self.config.p2pPort});

		self.server.on('connection', function(ws) { self.initConnection(ws); });

		console.log('Listening P2P on port: ' + self.config.p2pPort);
	}

	/**
	 * Init connection.
	 * @param WebSocket ws
	 */
	initConnection(ws)
	{
		var self = this;

		self.sockets.push(ws);
		self.initMessageHandler(ws);
		self.initErrorHandler(ws);
	}

	/**
	 * Init message handler.
	 * @param WebSocket ws
	 */
	initMessageHandler(ws)
	{
		var self = this;

		ws.on('message', function(data) {
			var message = JSON.parse(data);
			console.log('Received message' + JSON.stringify(message));
		});
	}

	/**
	 * Init error handler.
	 * @param WebSocket ws
	 */
	initErrorHandler(ws)
	{
		var self = this;

		ws.on('close', function() { self.closeConnection(ws); });
		ws.on('error', function() { self.closeConnection(ws); });
	}

	/**
	 * Close connection to peer.
	 * @param WebSocket ws
	 */
	closeConnection(ws)
	{
		var self = this;

		console.log('Connection failed to peer: ' + ws.url);
		self.sockets.splice(self.sockets.indexOf(ws), 1);
	}

	/**
	 * Send request.
	 * @param WebSocket ws
	 * @param int type
	 */
	ask(ws, type)
	{
		write(ws, type);
	}

	/**
	 * Set component.s
	 * @param string name
	 * @param object component
	 */
	setComponent(name, component)
	{
		var self = this;
		
		self.components.name = component;
	}
}

module.exports = P2PNetwork;