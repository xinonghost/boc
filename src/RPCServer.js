/**
 * @author Vladyslav Zaichuk <xinonghost@gmail.com>
 */

'use strict'

var express = require("express");
var bodyParser = require('body-parser');

class RPCServer
{
	constructor(config)
	{
		/** @var object config App configuration. */
		this.config = config;

		/** @var express app */
		this.app = null;

		/** @var object components */
		this.components = {};
	}

	/**
	 * Start server.
	 */
	start()
	{
		var self = this;
		
		self.app = express();
		self.app.use(bodyParser.json());

		self.app.get('/blocks', function(req, res) {
			res.send(JSON.stringify(self.components.blockchain.getBlocks()));
		});

		self.app.listen(
			self.config.rpcPort,
			function() { console.log('Listening RPC on port: ' + self.config.rpcPort); }
		);
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