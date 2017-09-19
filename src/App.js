/**
 * @author Vladyslav Zaichuk <xinonghost@gmail.com>
 */

'use strict'

var express = require("express");
var bodyParser = require('body-parser');

var Blockchain = require('./Blockchain');
var P2PNetwork = require('./P2PNetwork');

/**
 * Class App
 */
class App
{
	/**
	 * Init application.
	 * @param object config
	 */
	constructor(config)
	{
		this.config = config;

		// Blockchain manager
		this.Blockchain = new Blockchain();

		// P2P network instance
		this.p2pNetwork = new P2PNetwork(config);
	}

	/**
	 * Run application.
	 */
	run()
	{
		var self = this;

		self.startRPCServer();
		self.startP2PNetwork();
	}

	/**
	 * Start RPC server.
	 */
	startRPCServer()
	{
		var self = this;
		
		var app = express();
		app.use(bodyParser.json());

		app.get('/blocks', function(req, res) {
			res.send(JSON.stringify(self.Blockchain.getBlocks()));
		});

		app.listen(
			self.config.rpcPort,
			function() { console.log('Listening RPC on port: ' + self.config.rpcPort); }
		);
	}

	/**
	 * Start P2P network.
	 */
	startP2PNetwork()
	{
		var self = this;

		self.p2pNetwork.setComponent('blockchain', self.Blockchain);
		self.p2pNetwork.start();
	}
}

module.exports = App;