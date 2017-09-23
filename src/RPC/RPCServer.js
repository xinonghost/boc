/**
 * @author Vladyslav Zaichuk <xinonghost@gmail.com>
 */

'use strict'

var express = require("express");
var bodyParser = require('body-parser');
var Response = require('./Response');

class RPCServer
{
	constructor(config, app)
	{
		/** @var object config App configuration. */
		this.config = config;

		/** @var express server */
		this.server = null;

		/** @var App app */
		this.app = app;

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
			res.send(JSON.stringify(self.components.blockchain.getBlocks()));
		});

		this.handleAddPeerRequest();

		self.server.listen(
			self.config.rpcPort,
			function() { console.log('Listening RPC on port: ' + self.config.rpcPort); }
		);
	}

	/**
	 * Add peer request handler.
	 */
	handleAddPeerRequest()
	{
		var self = this;

		self.server.get('/peers/add/:ip', function(req, res) {
			console.log(self.app.p2pNetwork.addPeer(req.params.ip));
			console.log(self.app.p2pNetwork.sockets);

			res.send(Response.give(req.params.ip));
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