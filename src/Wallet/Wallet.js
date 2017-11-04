/**
 * @author Vladyslav Zaichuk <xinonghost@gmail.com>
 */

'use strict'

var bitcoin = require('bitcoinjs-lib');
var DB = require('./../DB');

/**
 * Class Wallet
 */
class Wallet
{
	constructor(app)
	{
		/** @var src.App app */
		this.app = app;

		/** @var DB db DB connection. */
		this.db = new DB();
	}

	/**
	 * Generate new key pair.
	 *
	 * @return object
	 */
	getNewKeyPair()
	{
		var pair = bitcoin.ECPair.makeRandom();

		var result = this.db.query("INSERT INTO wallet_key (priv, address) VALUES ('"+pair.toWIF()+"', '"+pair.getAddress()+"')");

		if (!result.success)
			return {'status':0, 'error':'Cant write new key pair into DB.'};

		return {'status':1, 'data':pair.getAddress()};
	}
}

module.exports = Wallet;