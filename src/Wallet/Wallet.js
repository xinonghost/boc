/**
 * @author Vladyslav Zaichuk <xinonghost@gmail.com>
 */

'use strict'

var bitcoin = require('bitcoinjs-lib');
var DB = require('./../DB');
var Exception = require('./../Exception');

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

		/** @var string issuer */
		this.issuer = '1ASU1sJXPZBPjwwpL2trLCsiJ9EXMddhqM';
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

	/**
	 * Try to find issuer key pair in current wallet.
	 *
	 * @return object
	 */
	getIssuerPair()
	{
		var result = this.db.query("SELECT * FROM wallet_key WHERE address = '"+this.issuer+"'");

		if (!result.success) {
			return {'status':0, 'error':'DB request fail'};
		}

		if (result.data.rows.length == 0) {
			return {'status':0, 'error':'Issuer key pair not found'};
		}

		var pair = bitcoin.ECPair.fromWIF(result.data.rows[0].priv);

		return {'status':1, 'data':pair};
	}

	/**
	 * Get pair by address.
	 *
	 * @param string
	 * @return object
	 */
	getAddressPair(address)
	{
		var result = this.db.query("SELECT * FROM wallet_key WHERE address = '"+address+"'");

		if (!result.success) {
			throw new Exception('DB request fail');
		}

		if (result.data.rows.length == 0) {
			throw new Exception('Key pair not found');
		}

		var pair = bitcoin.ECPair.fromWIF(result.data.rows[0].priv);

		return pair;
	}
}

module.exports = Wallet;