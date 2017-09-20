/**
 * @author Vladyslav Zaichuk <xinonghost@gmail.com>
 */

'use strict'

var Blockchain = require('./Blockchain');
var P2PNetwork = require('./P2PNetwork');
var RPCServer = require('./RPCServer');

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

		/** @var Blockchain Blockchain */
		this.blockchain = new Blockchain();

		/** @var P2PNetwork phpNetwork */
		this.p2pNetwork = new P2PNetwork(config);

		/** @var RPCServer rpcServer */
		this.rpcServer = new RPCServer(config);
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
		
		self.rpcServer.setComponent('blockchain', self.blockchain);
		self.rpcServer.start();
	}

	/**
	 * Start P2P network.
	 */
	startP2PNetwork()
	{
		var self = this;

		self.p2pNetwork.setComponent('blockchain', self.blockchain);
		self.p2pNetwork.start();
	}
}

module.exports = App;