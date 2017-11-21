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
var Block = require('./../Block');

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

		// Create new contract
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

			if (saved) {
				self.app.p2pNetwork.broadcastTransaction(transaction.getRaw());
				return res.send({'status':1, 'data':txid});
			} else {
				return res.send({'status':0, 'error':'Cant save transaction'});
			}
		});

		// Send contract
		self.server.post('/send', function(req, res) {
			if (!req.body.txid) {
				return res.send(JSON.stringify({'status':0, 'error':'TXID not provided'}));
			}

			if (!req.body.address) {
				return res.send(JSON.stringify({'status':0, 'error':'Address not provided'}));
			}

			try {
				var prevTransaction = Transaction.findByTxid(req.body.txid);

				var transaction = new Transaction();
				transaction.setInput({'type':0, 'data':prevTransaction.generateHash()});
				transaction.setOutput(req.body.address);

				var sender = (new Wallet()).getAddressPair(prevTransaction.output);

				var signature = bitcoinMessage.sign(
					transaction.getDataToSign(),
					sender.d.toBuffer(32),
					sender.compressed
				).toString('base64');

				transaction.setSignature(signature);
				var txid = transaction.generateHash();

				if (transaction.save()) {
					self.app.p2pNetwork.broadcastTransaction(transaction.getRaw());
					return res.send({'status':1, 'data':txid});
				} else {
					return res.send({'status':0, 'error':'Cant save transaction'});
				}
			} catch (e) {
				return res.send({'status':0, 'error':e.message});
			}
		});

		// Submit new block.
		self.server.post('/submitblock', function(req, res) {
			if (!req.body.block) {
				return res.send(JSON.stringify({'status':0, 'error':'Block data not provided'}));
			}

			var result = self.app.blockchain.connectBlock(req.body.block);

			if (result.status) {
				self.app.p2pNetwork.broadcastBlock(self.app.blockchain.getLatestBlock().getRaw());
			}

			return res.send(JSON.stringify(result));
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