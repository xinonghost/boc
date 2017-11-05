/**
 * @author Vladyslav Zaichuk <xinonghost@gmail.com>
 */

'use strict'

var WebSocket = require("ws");
var Message = require('./Message');
var Queue = require('./Queue');
var Transaction = require('./../Transaction');

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

		/** @var object states */
		this.states = {};

		/** @var Queue syncQueue */
		this.syncQueue = new Queue();

		/** @var array WS IPs */
		this.peerIPs = [];
	}

	/**
	 * Compose WS id.
	 * @param object ws
	 * @return string
	 */
	static getWSId(ws)
	{
		return ws._socket.remoteAddress + ':' + ws._socket.remotePort;
	}

	/**
	 * Compose WS IP address.
	 * @param object ws
	 * @return string
	 */
	static getWSIP(ws)
	{
		return ws._socket.remoteAddress;
	}

	/**
	 * Init server.
	 */
	start()
	{
		var self = this;

		self.server = new WebSocket.Server({port: self.app.config.p2pPort});

		self.server.on('connection', function(ws) { self.initConnection(ws, self); });

		console.log('[P2P] Listening P2P on port: ' + self.app.config.p2pPort);
	}

	/**
	 * Queue processor.
	 * @param string id
	 * @param object self
	 */
	processQueue(id, self)
	{
		var data = self.syncQueue.take(id);
		if (!data) return;

		switch (data.message.type) {
			case Message.QUERY_LATEST:
				console.log('[P2P][INFO] Latest block asked.');

				var lastBlockResponse = new Message(Message.RESPONSE_LATEST, self.app.blockchain.getLatestBlock().getRaw());

				self.answer(data.ws, lastBlockResponse);
				
				console.log('[P2P][INFO] Latest block answered.');
				break;
			case Message.RESPONSE_LATEST:
				console.log('[P2P][INFO] Latest block response received.');
				break;
			case Message.BROADCAST_TRANSACTION:
				console.log('[P2P][INFO] Received new transaction.');
				var transaction = Transaction.fromRaw(data.message.data);
				break;
			default:
				console.log('[P2P][WARNING] Undefined message type received.');
		}
	}

	/**
	 * Init connection.
	 * @param WebSocket ws
	 */
	initConnection(ws, self)
	{
		if (self.peerIPs.indexOf(P2PNetwork.getWSIP(ws)) != -1) {
			console.log('[INFO] Peer is already exists.');
			ws.close();
			return;
		}

		self.sockets.push(ws);
		self.peerIPs.push(P2PNetwork.getWSIP(ws));
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
			
			var data = {
				'id': P2PNetwork.getWSId(ws),
				'ws': ws,
				'message': message
			};
			self.syncQueue.put(data);
			self.processQueue(data.id, self);
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
		console.log('Connection closed to peer: ' + P2PNetwork.getWSId(ws));
		if (self.sockets.indexOf(ws) != -1) {
			self.peerIPs.splice(self.peerIPs.indexOf(P2PNetwork.getWSIP(ws)), 1);
			self.sockets.splice(self.sockets.indexOf(ws), 1);
		}
	}

	/**
	 * Close connection to peer.
	 * @param WebSocket ws
	 */
	failConnection(ws, self)
	{
		console.log('Connection failed to peer: ' + P2PNetwork.getWSId(ws));
		if (self.sockets.indexOf(ws) != -1) {
			self.peerIPs.splice(self.peerIPs.indexOf(P2PNetwork.getWSIP(ws)), 1);
			self.sockets.splice(self.sockets.indexOf(ws), 1);
		}
	}

	/**
	 * Send request.
	 * @param WebSocket ws
	 * @param Message message
	 */
	ask(ws, message)
	{
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

	/**
	 * Broadcast transaction.
	 *
	 * @param string rawTx
	 */
	broadcastTransaction(rawTx)
	{
		var self = this;
		var message = new Message(Message.BROADCAST_TRANSACTION, rawTx);

		self.sockets.forEach(function(ws) {
			self.ask(ws, message);
		});
	}
}

module.exports = P2PNetwork;