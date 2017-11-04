/**
 * @author Vladyslav Zaichuk <xinonghost@gmail.com>
 */

'use strict'

var express = require("express");
var bodyParser = require('body-parser');
var Response = require('./Response');
var Wallet = require('../Wallet/Wallet');
var bitcoinMessage = require('bitcoinjs-message');

class RPCServer
{
	constructor(app)
	{
		/** @var App app */
		this.app = app;

		/** @var express server */
		this.server = null;

		/** @var object components */
		this.components = {};
	}

	/**
	 * Start server.
	 */
	start()
	{
		var self = this;
		
		self.server = express();
		self.server.use(bodyParser.json());

		self.server.get('/blocks', function(req, res) {
			res.send(JSON.stringify(self.app.blockchain.getBlocks()));
		});

		this.handleAddPeerRequest();

		self.server.listen(
			self.app.config.rpcPort,
			function() { console.log('[RPC] Listening RPC on port: ' + self.app.config.rpcPort); }
		);

		// Generate new key pair.
		self.server.get('/getnewaddress', function(req, res) {
			var wallet = new Wallet();
			res.send(JSON.stringify(wallet.getNewKeyPair()));

			// var privateKey = pair.d.toBuffer(32);
			// var message = 'This is an example of a signed message.';
			// var signature = bitcoinMessage.sign(message, privateKey, pair.compressed);

			// res.send(JSON.stringify(signature.toString('base64')));
		});
	}

	/**
	 * Add peer request handler.
	 */
	handleAddPeerRequest()
	{
		var self = this;

		self.server.get('/peers/add/:ip', function(req, res) {
			var result = self.app.p2pNetwork.addPeer(req.params.ip)
			if (!result)
				res.send(Response.give(req.params.ip));
			else
				res.send(Response.giveError(result));
		});
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
}

module.exports = RPCServer;