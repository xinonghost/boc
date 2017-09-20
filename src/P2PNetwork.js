/**
 * @author Vladyslav Zaichuk <xinonghost@gmail.com>
 */

'use strict'

var WebSocket = require("ws");
var Message = require('./Message');

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

		var message = new Message(Message.GUERY_LATEST);
		self.ask(ws, message);
	}

	/**
	 * Init message handler.
	 * @param WebSocket ws
	 */
	initMessageHandler(ws)
	{
		var self = this;

		ws.on('message', function(data) {
			var message = Message.parse(data);
			console.log('Received message' + JSON.stringify(message));

			switch (message.type) {
				case Message.GUERY_LATEST:
					console.log('[INFO] Latest block asked.');
					self.answer(ws, new Message(Message.RESPONSE_LATEST, 1));
					break;
				case Message.RESPONSE_LATEST:
					console.log('[INFO] Latest block response received.');
					break;
				default:
					console.log('[WARNING] Undefined message type received.');
			}
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
	 * @param Message message
	 */
	ask(ws, message)
	{
		write(ws, message.pack());
	}

	/**
	 * Send response.
	 * @param WebSocket ws
	 * @param Message message
	 */
	answer(ws, message)
	{
		var self = this;

		self.ask(ws, message);
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