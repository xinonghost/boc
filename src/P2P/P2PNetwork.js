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
	constructor(app)
	{
		/** @var App app */
		this.app = app;

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

		self.server = new WebSocket.Server({port: self.app.config.p2pPort});

		self.server.on('connection', function(ws) { self.initConnection(ws, self); });

		console.log('Listening P2P on port: ' + self.app.config.p2pPort);
	}

	/**
	 * Init connection.
	 * @param WebSocket ws
	 */
	initConnection(ws, self)
	{
		self.sockets.push(ws);
		self.initMessageHandler(ws, self);
		self.initErrorHandler(ws, self);

		console.log('[P2P] New connection established.');

		var message = new Message(Message.QUERY_LATEST);
		self.ask(ws, message);
	}

	/**
	 * Init message handler.
	 * @param WebSocket ws
	 */
	initMessageHandler(ws, self)
	{
		ws.on('message', function(data) {
			var message = Message.unpack(data);
			console.log('Received message: ' + JSON.stringify(message));
			
			switch (message.type) {
				case Message.QUERY_LATEST:
					console.log('[INFO] Latest block asked.');
					// self.answer(ws, new Message(Message.RESPONSE_LATEST, 1));
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
	initErrorHandler(ws, self)
	{
		ws.on('close', function() { self.closeConnection(ws, self); });
		ws.on('error', function(e) {
			console.log(e);
			self.failConnection(ws, self);
		});
	}

	/**
	 * Close connection to peer.
	 * @param WebSocket ws
	 */
	closeConnection(ws, self)
	{
		console.log('Connection closed to peer: ' + ws._socket.remoteAddress + ':' + ws._socket.remotePort);
		self.sockets.splice(self.sockets.indexOf(ws), 1);
	}

	/**
	 * Close connection to peer.
	 * @param WebSocket ws
	 */
	failConnection(ws, self)
	{
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
		console.log(message.pack());
		ws.send(message.pack());
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
		
		self.components[name] = component;
	}

	/**
	 * Add peer.
	 * @param string ip
	 * @return string|bool
	 */
	addPeer(ip)
	{
		var self = this;

		var peer = 'ws://' + ip + ':' + self.app.config.p2pPort;

		try {
			var ws = new WebSocket(peer);
			ws.on('open', function() { self.initConnection(ws, self); });
			ws.on('error', function(e) {
				console.log('[P2P] Connection failed to IP: ' + ip);
			});
		} catch (e) {
			console.log('[P2P] Connection error: ' + e.message);
			return e.message;
		}

		return false;
	}
}

module.exports = P2PNetwork;