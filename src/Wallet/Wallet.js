/**
 * @author Vladyslav Zaichuk <xinonghost@gmail.com>
 */

'use strict'

var bitcoin = require('bitcoinjs-lib');

/**
 * Class Wallet
 */
class Wallet
{
	constructor(app)
	{
		/** @var src.App app */
		this.app = app;
	}

	/**
	 * Generate new key pair.
	 *
	 * @return object
	 */
	getNewKeyPair()
	{
		return bitcoin.ECPair.makeRandom();
	}
}

module.exports = Wallet;