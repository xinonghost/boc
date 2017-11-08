/**
 * @author Vladyslav Zaichuk <xinonghost@gmail.com>
 */

'use strict'

var express = require("express");
var bodyParser = require('body-parser');
var Response = require('./Response');
var Wallet = require('../Wallet/Wallet');
var Transaction = require('../Transaction');
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
		});

		self.server.post('/createcontract', function(req, res) {
			if (!req.body.contract) {
				return res.send(JSON.stringify({'status':0, 'error':'Contract content not provided'}));
			}

			if (!req.body.address) {
				return res.send(JSON.stringify({'status':0, 'error':'Contract target address not provided'}));
			}

			var transaction = new Transaction();
			transaction.setInput({'type':1, 'data':req.body.contract});
			transaction.setOutput(req.body.address);

			var issuer = (new Wallet()).getIssuerPair();
			if (issuer.status == 0) {
				return res.send(issuer);
			}

			issuer = issuer.data;

			var signature = bitcoinMessage.sign(
				transaction.getDataToSign(),
				issuer.d.toBuffer(32),
				issuer.compressed
			).toString('base64');

			transaction.setSignature(signature);
			var txid = transaction.generateHash();
			var saved = transaction.save();

			console.log(transaction);

			if (saved) {
				self.app.p2pNetwork.broadcastTransaction(transaction.getRaw());
				return res.send({'status':1, 'data':txid});
			} else {
				return res.send({'status':0, 'error':'Cant save transaction'});
			}
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